import com.google.gson.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

// Mesmo protocolo das imagens js/python, mas compilado: javac uma vez e java por
// entrada. So /tmp e gravavel no container.
public class Harness {
    public static void main(String[] argv) throws Exception {
        JsonObject payload;
        try {
            String input = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
            payload = JsonParser.parseString(input).getAsJsonObject();
        } catch (Exception e) {
            emit(err("Entrada invalida para o executor"));
            return;
        }

        String code = str(payload, "code");
        String mode = payload.has("mode") && !payload.get("mode").isJsonNull()
                ? payload.get("mode").getAsString() : "stdin";
        String entry = str(payload, "entryPoint");
        long timeoutMs = payload.has("caseTimeoutMs") && !payload.get("caseTimeoutMs").isJsonNull()
                ? payload.get("caseTimeoutMs").getAsLong() : 5000;
        List<String> stdins = new ArrayList<>();
        if (payload.has("stdins") && payload.get("stdins").isJsonArray())
            for (JsonElement e : payload.getAsJsonArray("stdins"))
                stdins.add(e.isJsonNull() ? "" : e.getAsString());

        Path dir = Files.createTempDirectory(Paths.get("/tmp"), "sub");
        Files.writeString(dir.resolve("Solution.java"), code);
        List<String> sources = new ArrayList<>(List.of("Solution.java"));
        String mainClass = "Solution";
        if ("function".equals(mode)) {
            Files.writeString(dir.resolve("Main.java"), driver(entry));
            sources.add("Main.java");
            mainClass = "Main";
        }

        List<String> javac = new ArrayList<>(List.of(
                "javac", "-encoding", "UTF-8", "-cp", "/opt/gson.jar", "-d", "."));
        javac.addAll(sources);
        Proc comp = run(javac, dir, null, 20000);
        if (comp.exit() != 0) {
            String msg = !comp.err().isBlank() ? comp.err() : comp.out();
            emit(err(trunc(msg.isBlank() ? "Erro de compilacao" : msg, 4000)));
            return;
        }

        JsonArray results = new JsonArray();
        for (String in : stdins) {
            Proc r = run(List.of(
                    "java", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1",
                    "-XX:+PerfDisableSharedMem", "-Xss8m", "-Xmx256m",
                    "-cp", "/opt/gson.jar:.", mainClass), dir, in, timeoutMs);
            JsonObject o = new JsonObject();
            o.addProperty("stdout", trunc(r.out(), 100_000));
            o.addProperty("stderr", trunc(r.err(), 4000));
            o.addProperty("exitCode", r.timedOut() ? 124 : r.exit());
            o.addProperty("timedOut", r.timedOut());
            results.add(o);
        }
        JsonObject root = new JsonObject();
        root.add("compileOutput", JsonNull.INSTANCE);
        root.add("results", results);
        System.out.print(root);
    }

    record Proc(String out, String err, int exit, boolean timedOut) {}

    // Drena stdout/stderr em threads, senao o buffer do pipe trava com saida grande.
    static Proc run(List<String> cmd, Path dir, String stdin, long timeoutMs) throws Exception {
        Process p = new ProcessBuilder(cmd).directory(dir.toFile()).start();
        ByteArrayOutputStream ob = new ByteArrayOutputStream();
        ByteArrayOutputStream eb = new ByteArrayOutputStream();
        Thread to = pump(p.getInputStream(), ob);
        Thread te = pump(p.getErrorStream(), eb);
        try (OutputStream os = p.getOutputStream()) {
            if (stdin != null) os.write(stdin.getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) {
        }
        boolean ok = p.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        boolean timedOut = !ok;
        if (timedOut) {
            p.destroyForcibly();
            p.waitFor();
        }
        to.join(2000);
        te.join(2000);
        int exit = timedOut ? 124 : p.exitValue();
        return new Proc(ob.toString(StandardCharsets.UTF_8), eb.toString(StandardCharsets.UTF_8), exit, timedOut);
    }

    static Thread pump(InputStream in, ByteArrayOutputStream buf) {
        Thread t = new Thread(() -> {
            try {
                in.transferTo(buf);
            } catch (IOException ignored) {
            }
        });
        t.setDaemon(true);
        t.start();
        return t;
    }

    // Driver do formato funcao: o Gson coage os args JSON para os tipos do metodo
    // (reflection) e serializa o retorno em JSON compacto.
    static String driver(String entry) {
        String e = entry.matches("[A-Za-z_$][\\w$]*") ? entry : "solve";
        return """
                import com.google.gson.*;
                import java.lang.reflect.*;
                import java.nio.charset.StandardCharsets;
                public class Main {
                  public static void main(String[] a) throws Exception {
                    Gson g = new Gson();
                    String in = new String(System.in.readAllBytes(), StandardCharsets.UTF_8).trim();
                    JsonArray args = in.isEmpty() ? new JsonArray() : JsonParser.parseString(in).getAsJsonArray();
                    Method m = null;
                    for (Method x : Solution.class.getDeclaredMethods())
                      if (x.getName().equals("__ENTRY__") && x.getParameterCount() == args.size()) { m = x; break; }
                    if (m == null) { System.err.println("Defina Solution.__ENTRY__(...) com os parametros do caso."); System.exit(1); }
                    m.setAccessible(true);
                    Type[] pt = m.getGenericParameterTypes();
                    Object[] call = new Object[pt.length];
                    for (int i = 0; i < pt.length; i++) call[i] = g.fromJson(args.get(i), pt[i]);
                    Object inst = Modifier.isStatic(m.getModifiers()) ? null
                        : Solution.class.getDeclaredConstructor().newInstance();
                    Object r = m.invoke(inst, call);
                    System.out.print(g.toJson(r));
                  }
                }
                """.replace("__ENTRY__", e);
    }

    static String str(JsonObject o, String k) {
        return o.has(k) && !o.get(k).isJsonNull() ? o.get(k).getAsString() : "";
    }

    static String trunc(String s, int n) {
        return s.length() > n ? s.substring(0, n) : s;
    }

    static JsonObject err(String msg) {
        JsonObject o = new JsonObject();
        o.addProperty("compileOutput", msg);
        o.add("results", new JsonArray());
        return o;
    }

    static void emit(JsonObject o) {
        System.out.print(o);
    }
}
