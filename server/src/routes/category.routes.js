import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listCategoriesValidator,
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdParamValidator,
} from "../validators/category.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listCategoriesValidator, validate, categoryController.listCategories);
router.post("/", createCategoryValidator, validate, categoryController.createCategory);
router.patch("/:id", updateCategoryValidator, validate, categoryController.updateCategory);
router.delete("/:id", categoryIdParamValidator, validate, categoryController.deleteCategory);

export default router;
