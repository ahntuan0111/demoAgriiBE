const aiService = require("../services/aiService");

/**
 * Controller xử lý POST /chat
 */
exports.handleChat = async (req, res) => {
  const { prompt, location } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Gọi service AI (gọi Python AI Engine)
    const aiResponse = await aiService.getAIResponse(prompt, location);
    res.json(aiResponse);
  } catch (err) {
    console.error("ChatController Error:", err.message);
    res.status(500).json({ 
      error: "Failed to get AI response",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/keywords - Chỉ extract keywords
 */
exports.handleExtractKeywords = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const keywords = await aiService.extractKeywords(prompt);
    res.json(keywords);
  } catch (err) {
    console.error("Extract Keywords Error:", err.message);
    res.status(500).json({ 
      error: "Failed to extract keywords",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/search - Chỉ tìm kiếm CSV
 */
exports.handleSearchData = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const searchResults = await aiService.searchData(prompt);
    res.json(searchResults);
  } catch (err) {
    console.error("Search Data Error:", err.message);
    res.status(500).json({ 
      error: "Failed to search data",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/search-by-keywords - Tìm kiếm dữ liệu theo từ khóa
 */
exports.handleSearchByKeywords = async (req, res) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || typeof keywords !== "object") {
      return res.status(400).json({ 
        error: "Keywords are required", 
        message: "Keywords must be a valid object" 
      });
    }
    
    // Gọi service AI để tìm kiếm theo từ khóa
    const searchResults = await aiService.searchByKeywords(keywords);
    
    // Trả về kết quả
    res.json(searchResults);
  } catch (err) {
    console.error("Search By Keywords Error:", err.message);
    res.status(500).json({ 
      error: "Failed to search by keywords",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/image - Phân tích bệnh cây từ hình ảnh
 */
exports.handleImageAnalysis = async (req, res) => {
  try {
    // Lấy dữ liệu hình ảnh từ request
    const imageData = req.body.image || req.body;
    
    // Gọi service AI để phân tích hình ảnh
    const analysisResult = await aiService.analyzePlantImage(imageData);
    
    // Kiểm tra nếu có lỗi trong quá trình xử lý hình ảnh
    if (analysisResult.error) {
      throw new Error(analysisResult.message || "Failed to analyze plant image");
    }
    
    // Tạo prompt từ kết quả phân tích
    const prompt = `Cây trồng: ${analysisResult.crop || analysisResult[0]?.cay_trong || 'unknown'}, Bệnh: ${analysisResult.disease || analysisResult[0]?.benh_lien_quan || 'unknown'}, Độ tin cậy: ${(analysisResult.confidence || analysisResult[0]?.confidence || 0) * 100}%. Hãy tư vấn cách xử lý.`;
    
    // Gọi AI để nhận phản hồi chi tiết
    const aiResponse = await aiService.getAIResponse(prompt);
    
    res.json({
      ...analysisResult,
      aiResponse: aiResponse.answer,
      keywords: aiResponse.keywords,
      csvResults: aiResponse.csvResults
    });
  } catch (err) {
    console.error("Image Analysis Error:", err.message);
    res.status(500).json({ 
      error: "Failed to analyze plant image",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/voice - Xử lý voice và trích xuất keywords
 */
exports.handleVoiceProcessing = async (req, res) => {
  try {
    // Lấy dữ liệu voice từ request
    const voiceData = req.body.voice || req.body;
    
    // Gọi service AI để xử lý voice
    const voiceResult = await aiService.processVoice(voiceData);
    
    // Kiểm tra nếu có lỗi trong quá trình xử lý voice
    if (voiceResult.error) {
      throw new Error(voiceResult.message || "Failed to process voice data");
    }
    
    // Kiểm tra nếu voiceResult có ai_response (đã được xử lý đầy đủ)
    if (voiceResult.ai_response) {
      // Trả về kết quả đã được xử lý đầy đủ
      res.json(voiceResult);
    } else {
      // Nếu chưa có ai_response, gọi AI để xử lý văn bản và nhận phản hồi
      const transcribedText = voiceResult.transcribed_text;
      const aiResponse = await aiService.getAIResponse(transcribedText);
      
      res.json({
        transcribed_text: transcribedText,
        ai_response: aiResponse.answer,
        keywords: aiResponse.keywords,
        csvResults: aiResponse.csvResults,
        modelUsed: aiResponse.modelUsed,
        totalFound: aiResponse.totalFound
      });
    }
  } catch (err) {
    console.error("Voice Processing Error:", err.message);
    res.status(500).json({ 
      error: "Failed to process voice data",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/add-crop - Thêm cây trồng mới
 */
exports.handleAddCrop = async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Crop name is required" });
  }

  try {
    const result = await aiService.addCrop(name);
    res.json(result);
  } catch (err) {
    console.error("Add Crop Error:", err.message);
    res.status(500).json({ 
      error: "Failed to add crop",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/add-disease - Thêm bệnh mới
 */
exports.handleAddDisease = async (req, res) => {
  const { name, crop } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Disease name is required" });
  }

  if (!crop || typeof crop !== "string") {
    return res.status(400).json({ error: "Crop is required" });
  }

  try {
    const result = await aiService.addDisease(name, crop);
    res.json(result);
  } catch (err) {
    console.error("Add Disease Error:", err.message);
    res.status(500).json({ 
      error: "Failed to add disease",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/add-keyword - Thêm từ khóa mới
 */
exports.handleAddKeyword = async (req, res) => {
  const { keyword, type } = req.body;

  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ error: "Keyword is required" });
  }

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "Keyword type is required" });
  }

  try {
    const result = await aiService.addKeyword(keyword, type);
    res.json(result);
  } catch (err) {
    console.error("Add Keyword Error:", err.message);
    res.status(500).json({ 
      error: "Failed to add keyword",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/file - Xử lý file upload
 */
exports.handleFileProcessing = async (req, res) => {
  try {
    // Lấy dữ liệu file từ request
    const { fileName, fileContent, fileType, prompt } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!fileName || !fileContent || !fileType) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "fileName, fileContent, and fileType are required" 
      });
    }
    
    // Gọi service AI để xử lý file, truyền thêm prompt nếu có
    const fileResult = await aiService.processFile(fileName, fileContent, fileType, prompt);
    
    // Kiểm tra nếu có lỗi trong quá trình xử lý file
    if (fileResult.error) {
      throw new Error(fileResult.message || "Failed to process file");
    }
    
    // Trả về kết quả
    res.json(fileResult);
  } catch (err) {
    console.error("File Processing Error:", err.message);
    res.status(500).json({ 
      error: "Failed to process file",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/save-suggestion - Lưu dữ liệu gợi ý
 */
exports.handleSaveSuggestion = async (req, res) => {
  try {
    const { crop, disease, product, location, farmer_role, action } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!crop || !disease || !product) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "crop, disease, and product are required" 
      });
    }
    
    // Gọi service AI để lưu dữ liệu gợi ý
    const saveResult = await aiService.saveSuggestion({
      crop,
      disease,
      product,
      location: location || "",
      farmer_role: farmer_role || "",
      action: action || ""
    });
    
    // Trả về kết quả
    res.json(saveResult);
  } catch (err) {
    console.error("Save Suggestion Error:", err.message);
    res.status(500).json({ 
      error: "Failed to save suggestion",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý GET /chat/get-suggestions - Lấy tất cả dữ liệu gợi ý
 */
exports.handleGetSuggestions = async (req, res) => {
  try {
    // Gọi service AI để lấy tất cả dữ liệu gợi ý
    const suggestions = await aiService.getAllSuggestions();
    
    // Trả về kết quả
    res.json(suggestions);
  } catch (err) {
    console.error("Get Suggestions Error:", err.message);
    res.status(500).json({ 
      error: "Failed to get suggestions",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý GET /farmers - Lấy tất cả dữ liệu nông dân
 */
exports.handleGetFarmers = async (req, res) => {
  try {
    // Gọi service AI để lấy tất cả dữ liệu nông dân
    const farmers = await aiService.getAllFarmers();
    
    // Trả về kết quả
    res.json(farmers);
  } catch (err) {
    console.error("Get Farmers Error:", err.message);
    res.status(500).json({ 
      error: "Failed to get farmers",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý GET /stores - Lấy tất cả dữ liệu cửa hàng
 */
exports.handleGetStores = async (req, res) => {
  try {
    // Gọi service AI để lấy tất cả dữ liệu cửa hàng
    const stores = await aiService.getAllStores();
    
    // Trả về kết quả
    res.json(stores);
  } catch (err) {
    console.error("Get Stores Error:", err.message);
    res.status(500).json({ 
      error: "Failed to get stores",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/create-product - Tạo sản phẩm mới với từ khóa
 */
exports.handleCreateProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!productData.ten_sp || !productData.cay_trong) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "ten_sp and cay_trong are required" 
      });
    }
    
    // Gọi service AI để tạo sản phẩm mới
    const result = await aiService.createProductWithKeywords(productData);
    
    // Trả về kết quả
    res.json(result);
  } catch (err) {
    console.error("Create Product Error:", err.message);
    res.status(500).json({ 
      error: "Failed to create product",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/search-products-by-keywords - Tìm kiếm sản phẩm theo từ khóa
 */
exports.handleSearchProductsByKeywords = async (req, res) => {
  try {
    const { keywords, limit } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ 
        error: "Invalid keywords", 
        message: "keywords must be an array" 
      });
    }
    
    // Gọi service AI để tìm kiếm sản phẩm
    const result = await aiService.searchProductsByKeywords(keywords, limit);
    
    // Trả về kết quả
    res.json(result);
  } catch (err) {
    console.error("Search Products by Keywords Error:", err.message);
    res.status(500).json({ 
      error: "Failed to search products by keywords",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/find-similar-products - Tìm sản phẩm tương tự theo từ khóa
 */
exports.handleFindSimilarProducts = async (req, res) => {
  try {
    const { keywords, limit } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ 
        error: "Invalid keywords", 
        message: "keywords must be an array" 
      });
    }
    
    // Gọi service AI để tìm sản phẩm tương tự
    const result = await aiService.findSimilarProductsByKeywords(keywords, limit);
    
    // Trả về kết quả
    res.json(result);
  } catch (err) {
    console.error("Find Similar Products Error:", err.message);
    res.status(500).json({ 
      error: "Failed to find similar products",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/find-nearest-stores - Tìm cửa hàng gần nhất
 */
exports.handleFindNearestStores = async (req, res) => {
  try {
    const { location, limit } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!location || typeof location !== "string") {
      return res.status(400).json({ 
        error: "Invalid location", 
        message: "location must be a string" 
      });
    }
    
    // Gọi service AI để tìm cửa hàng gần nhất
    const result = await aiService.findNearestStores(location, limit);
    
    // Trả về kết quả
    res.json(result);
  } catch (err) {
    console.error("Find Nearest Stores Error:", err.message);
    res.status(500).json({ 
      error: "Failed to find nearest stores",
      message: err.message 
    });
  }
};

/**
 * Controller xử lý POST /chat/search-stores-by-product-location - Tìm cửa hàng có sản phẩm gần vị trí
 */
exports.handleSearchStoresByProductAndLocation = async (req, res) => {
  try {
    const { product_name, location, limit } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!product_name || typeof product_name !== "string") {
      return res.status(400).json({ 
        error: "Invalid product name", 
        message: "product_name must be a string" 
      });
    }
    
    if (!location || typeof location !== "string") {
      return res.status(400).json({ 
        error: "Invalid location", 
        message: "location must be a string" 
      });
    }
    
    // Gọi service AI để tìm cửa hàng
    const result = await aiService.searchStoresByProductAndLocation(product_name, location, limit);
    
    // Trả về kết quả
    res.json(result);
  } catch (err) {
    console.error("Search Stores by Product and Location Error:", err.message);
    res.status(500).json({ 
      error: "Failed to search stores by product and location",
      message: err.message 
    });
  }
};