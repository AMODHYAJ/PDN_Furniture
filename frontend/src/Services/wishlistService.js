import api from '../utils/api'; // Using the configured axios instance with interceptors

const API_BASE_URL = '/wishlists'; // Relative path since baseURL is set in api.js

/**
 * Add item to user's wishlist
 * @param {string} userId - ID of the user
 * @param {string} productId - ID of the product to add
 * @returns {Promise<Object>} Response data
 */
export const addItemToWishlist = async (userId, productId) => {
    try {
        const response = await api.post(`${API_BASE_URL}/add`, { 
            userId, 
            productId 
        });
        return {
            success: true,
            wishlist: response.data.wishlist,
            message: response.data.message || 'Product added to wishlist'
        };
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to add to wishlist'
        };
    }
};

/**
 * Get user's wishlist with updated product information
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Response data with wishlist items
 */
export const getWishlist = async (userId) => {
    try {
        const response = await api.get(`${API_BASE_URL}/user/${userId}?freshData=true`);
        return {
            success: true,
            items: response.data.items || [],
            wishlist: response.data.wishlist || { items: [] }
        };
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to fetch wishlist',
            items: []
        };
    }
};


/**
 * Remove item from wishlist
 * @param {string} userId - ID of the user
 * @param {string} productId - ID of the product to remove
 * @returns {Promise<Object>} Response data
 */
export const removeFromWishlist = async (userId, productId) => {
    try {
        const response = await api.delete(`${API_BASE_URL}/remove/${userId}/${productId}`);
        return {
            success: true,
            wishlist: response.data.wishlist,
            message: response.data.message || 'Item removed from wishlist'
        };
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to remove from wishlist'
        };
    }
};

/**
 * Move item from wishlist to cart
 * @param {string} userId - ID of the user
 * @param {string} productId - ID of the product to move
 * @returns {Promise<Object>} Response data
 */
export const moveToCart = async (userId, productId) => {
    try {
        const response = await api.post(`${API_BASE_URL}/move-to-cart/${userId}`, { 
            productId 
        });
        return {
            success: true,
            wishlist: response.data.wishlist,
            cart: response.data.cart,
            message: response.data.message || 'Item moved to cart'
        };
    } catch (error) {
        console.error('Error moving to cart:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to move to cart'
        };
    }
};

/**
 * Clear user's wishlist
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Response data
 */
export const clearWishlist = async (userId) => {
    try {
        const response = await api.delete(`${API_BASE_URL}/clear/${userId}`);
        return {
            success: true,
            wishlist: response.data.wishlist,
            message: response.data.message || 'Wishlist cleared'
        };
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to clear wishlist'
        };
    }
};