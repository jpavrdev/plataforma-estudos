import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    listRoadmaps,
    getRoadmap,
    listRoadmapsStudio,
    getRoadmapStudio,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    createStage,
    updateStage,
    deleteStage,
    createStageRef,
    deleteStageRef,
} from "../controllers/RoadmapController.ts";

const router = Router();

// Leitura (qualquer logado)
router.get("/roadmaps", autenticar, listRoadmaps);

// Gestão pelo estúdio (admin). Vem antes de "/roadmaps/:slug" e usa o prefixo
// "/studio" para não colidir com a rota de detalhe do aluno.
router.get("/studio/roadmaps", autenticar, exigirAdmin, listRoadmapsStudio);
router.get("/studio/roadmaps/:id", autenticar, exigirAdmin, getRoadmapStudio);
router.post("/roadmaps", autenticar, exigirAdmin, createRoadmap);
router.patch("/roadmaps/:id", autenticar, exigirAdmin, updateRoadmap);
router.delete("/roadmaps/:id", autenticar, exigirAdmin, deleteRoadmap);
router.post("/roadmaps/:id/stages", autenticar, exigirAdmin, createStage);
router.patch("/roadmap-stages/:id", autenticar, exigirAdmin, updateStage);
router.delete("/roadmap-stages/:id", autenticar, exigirAdmin, deleteStage);
router.post("/roadmap-stages/:id/refs", autenticar, exigirAdmin, createStageRef);
router.delete("/roadmap-stage-refs/:id", autenticar, exigirAdmin, deleteStageRef);

// Detalhe do aluno por slug (por último, para não capturar as rotas acima).
router.get("/roadmaps/:slug", autenticar, getRoadmap);

export default router;
