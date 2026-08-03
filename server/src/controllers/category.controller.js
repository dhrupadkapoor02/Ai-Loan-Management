import asyncHandler from "express-async-handler";
import * as categoryService from "../services/category.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user.id, req.query.type);
  return sendSuccess(res, { message: "Categories fetched", data: { categories } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon } = req.body;
  const category = await categoryService.createCategory(req.user.id, { name, type, icon });
  return sendSuccess(res, { statusCode: 201, message: "Category created", data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: "Category updated", data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Category deleted" });
});
