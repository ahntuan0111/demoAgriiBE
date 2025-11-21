const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// POST /chat - Complete AI response with CSV data
router.post("/", chatController.handleChat);

// POST /chat/keywords - Extract keywords only
router.post("/keywords", chatController.handleExtractKeywords);

// POST /chat/search - Search CSV data only
router.post("/search", chatController.handleSearchData);

// POST /chat/image - Analyze plant disease from image
router.post("/image", chatController.handleImageAnalysis);

// POST /chat/voice - Process voice and extract keywords
router.post("/voice", chatController.handleVoiceProcessing);

// POST /chat/file - Process uploaded file
router.post("/file", chatController.handleFileProcessing);

// POST /chat/add-crop - Add new crop
router.post("/add-crop", chatController.handleAddCrop);

// POST /chat/add-disease - Add new disease
router.post("/add-disease", chatController.handleAddDisease);

// POST /chat/add-keyword - Add new keyword
router.post("/add-keyword", chatController.handleAddKeyword);

// POST /chat/save-suggestion - Save suggestion data
router.post("/save-suggestion", chatController.handleSaveSuggestion);

// GET /chat/get-suggestions - Get all suggestions
router.get("/get-suggestions", chatController.handleGetSuggestions);

// POST /chat/search-by-keywords - Search data by keywords
router.post("/search-by-keywords", chatController.handleSearchByKeywords);

// GET /farmers - Get all farmers
router.get("/farmers", chatController.handleGetFarmers);

// GET /stores - Get all stores
router.get("/stores", chatController.handleGetStores);

// POST /chat/create-product - Create new product with keywords
router.post("/create-product", chatController.handleCreateProduct);

// POST /chat/search-products-by-keywords - Search products by keywords
router.post("/search-products-by-keywords", chatController.handleSearchProductsByKeywords);

// POST /chat/find-similar-products - Find similar products by keywords
router.post("/find-similar-products", chatController.handleFindSimilarProducts);

// POST /chat/find-nearest-stores - Find nearest stores
router.post("/find-nearest-stores", chatController.handleFindNearestStores);

// POST /chat/search-stores-by-product-location - Search stores by product and location
router.post("/search-stores-by-product-location", chatController.handleSearchStoresByProductAndLocation);

module.exports = router;