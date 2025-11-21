const axios = require("axios");

/**
 * Service xử lý logic AI
 * Gọi Python AI Engine qua HTTP
 * Xử lý dữ liệu JSON thay vì CSV
 * Tự động chọn model AI phù hợp dựa trên quota và hiệu năng
 */

// URL của Python AI Engine
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:8000";

exports.getAIResponse = async (prompt, location = {}) => {
  try {
    // Gọi endpoint /ai-with-data để nhận AI response với JSON data và tự động chọn model phù hợp
    const response = await axios.post(
      `${PYTHON_AI_URL}/ai-with-data`,
      {
        prompt: prompt,
        location: location,
      },
      {
        timeout: 60000, // 60 seconds timeout
      }
    );

    const data = response.data;

    // Format response để phù hợp với frontend
    return {
      answer: data.answer || "Không nhận được phản hồi từ AI",
      keywords: data.keywords || {},
      csvResults: data.csvResults || data.results || [],
      modelUsed: data.modelUsed || "unknown",
      totalFound: (data.csvResults || data.results || []).length || 0,
      showSuggestions: typeof data.showSuggestions === 'boolean' 
        ? data.showSuggestions 
        : data.showSuggestions === true || 
          (typeof data.showSuggestions === 'string' && 
           data.showSuggestions.toLowerCase() === 'true') || 
          false,
      suggestions: data.suggestions || {},  // Add this line to pass suggestions data
      // model_used now shows which AI model was actually used from the automatic selection
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    console.error("AI Service Error details:", error);

    // Fallback response nếu Python AI không hoạt động
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Không thể kết nối đến AI Engine. Vui lòng kiểm tra Python server đang chạy tại http://localhost:8000. Chạy START_ALL.bat để khởi động tất cả services."
      );
    }

    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(
        "Timeout: AI Engine phản hồi quá lâu. Kiểm tra Python server và OpenAI API key."
      );
    }

    throw new Error(`AI Service Error: ${error.message}`);
  }
};

/**
 * Extract keywords only (không cần AI response đầy đủ)
 */
exports.extractKeywords = async (prompt) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/extract-keywords`,
      { text: prompt },
      { timeout: 15000 }
    );

    return response.data;
  } catch (error) {
    console.error("Extract Keywords Error:", error.message);
    throw new Error(`Failed to extract keywords: ${error.message}`);
  }
};

/**
 * Search JSON data only
 */
exports.searchData = async (prompt) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/search-data`,
      { prompt: prompt },  // This should work as is
      { timeout: 15000 }
    );

    return response.data;
  } catch (error) {
    console.error("Search Data Error:", error.message);
    throw new Error(`Failed to search data: ${error.message}`);
  }
};

/**
 * Search data by keywords
 */
exports.searchByKeywords = async (keywords) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/search-by-keywords`,
      { keywords: keywords },  // This should work as is
      { timeout: 15000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Search By Keywords Error:", error.message);
    throw new Error(`Failed to search by keywords: ${error.message}`);
  }
};

/**
 * Process voice data and convert to text
 */
exports.processVoice = async (voiceData) => {
  try {
    console.log("Sending voice data to Python AI Engine...");
    console.log("Voice data type:", typeof voiceData);
    console.log("Voice data length:", typeof voiceData === 'string' ? voiceData.length : 'N/A');
    
    const response = await axios.post(
      `${PYTHON_AI_URL}/process-voice`,
      { voice: voiceData },  // This should work as is
      { 
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Received response from Python AI Engine");
    return response.data;
  } catch (error) {
    console.error("Process Voice Error:", error.message);
    console.error("Process Voice Error details:", error);
    
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    
    throw new Error(`Failed to process voice: ${error.message}`);
  }
};

/**
 * Analyze plant disease from image
 */
exports.analyzePlantImage = async (imageData) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/analyze-plant-image`,
      { image: imageData },  // This should work as is
      { timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    console.error("Analyze Plant Image Error:", error.message);
    throw new Error(`Failed to analyze plant image: ${error.message}`);
  }
};

/**
 * Process uploaded file
 */
exports.processFile = async (fileName, fileContent, fileType, prompt) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/process-file`,
      { fileName, fileContent, fileType, prompt }, // This should work as is
      { timeout: 60000 }
    );

    return response.data;
  } catch (error) {
    console.error("Process File Error:", error.message);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

/**
 * Add new crop to database
 */
exports.addCrop = async (name) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/add-crop`,
      { name: name },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Add Crop Error:", error.message);
    throw new Error(`Failed to add crop: ${error.message}`);
  }
};

/**
 * Add new disease to database
 */
exports.addDisease = async (name, crop) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/add-disease`,
      { name: name, crop: crop },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Add Disease Error:", error.message);
    throw new Error(`Failed to add disease: ${error.message}`);
  }
};

/**
 * Add new keyword to database
 */
exports.addKeyword = async (keyword, type) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/add-keyword`,
      { keyword: keyword, type: type },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Add Keyword Error:", error.message);
    throw new Error(`Failed to add keyword: ${error.message}`);
  }
};

/**
 * Save suggestion data to database
 */
exports.saveSuggestion = async (data) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/save-suggestion`,
      data,  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Save Suggestion Error:", error.message);
    throw new Error(`Failed to save suggestion: ${error.message}`);
  }
};

/**
 * Get all suggestions from database
 */
exports.getAllSuggestions = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_AI_URL}/get-suggestions`,  // Changed from /suggestions to /get-suggestions
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Get Suggestions Error:", error.message);
    throw new Error(`Failed to get suggestions: ${error.message}`);
  }
};

/**
 * Get all farmers from database
 */
exports.getAllFarmers = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_AI_URL}/farmers`,  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Get Farmers Error:", error.message);
    throw new Error(`Failed to get farmers: ${error.message}`);
  }
};

/**
 * Get all stores from database
 */
exports.getAllStores = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_AI_URL}/stores`,  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Get Stores Error:", error.message);
    throw new Error(`Failed to get stores: ${error.message}`);
  }
};

/**
 * Create a new product with keywords
 */
exports.createProductWithKeywords = async (productData) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/products/create`,
      productData,  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Create Product Error:", error.message);
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

/**
 * Search products by keywords
 */
exports.searchProductsByKeywords = async (keywords, limit = 10) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/products/search-by-keywords`,
      { keywords, limit },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Search Products by Keywords Error:", error.message);
    throw new Error(`Failed to search products by keywords: ${error.message}`);
  }
};

/**
 * Find similar products by keywords
 */
exports.findSimilarProductsByKeywords = async (keywords, limit = 10) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/products/search-similar-by-keywords`,
      { keywords, limit },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Find Similar Products by Keywords Error:", error.message);
    throw new Error(`Failed to find similar products by keywords: ${error.message}`);
  }
};

/**
 * Find nearest stores based on user location
 */
exports.findNearestStores = async (location, limit = 5) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/stores/find-nearest`,
      { location, limit },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Find Nearest Stores Error:", error.message);
    throw new Error(`Failed to find nearest stores: ${error.message}`);
  }
};

/**
 * Find stores with specific product near user location
 */
exports.searchStoresByProductAndLocation = async (productName, location, limit = 5) => {
  try {
    const response = await axios.post(
      `${PYTHON_AI_URL}/stores/search-by-product-location`,
      { product_name: productName, location, limit },  // This should work as is
      { timeout: 10000 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Search Stores by Product and Location Error:", error.message);
    throw new Error(`Failed to search stores by product and location: ${error.message}`);
  }
};
