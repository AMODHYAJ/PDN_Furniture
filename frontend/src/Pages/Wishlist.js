import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { 
    getWishlist, 
    removeFromWishlist,
    moveToCart,
    clearWishlist
} from '../Services/wishlistService';
import { Link } from 'react-router-dom';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import './Wishlist.css';

const Wishlist = () => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({
        remove: null,
        move: null,
        clear: false
    });
    const [reminderSet, setReminderSet] = useState({});

    const fetchWishlist = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const { success, items, error } = await getWishlist(user._id);
            
            if (success) {
                setWishlistItems(items);
                setError('');
            } else {
                setError(error);
            }
        } catch (err) {
            setError('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const handleRemoveItem = async (productId) => {
        try {
            setActionLoading({...actionLoading, remove: productId});
            const { success, error } = await removeFromWishlist(user._id, productId);
            
            if (success) {
                setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
            } else {
                setError(error);
            }
        } catch (err) {
            setError('Failed to remove item');
        } finally {
            setActionLoading({...actionLoading, remove: null});
        }
    };

    const handleMoveToCart = async (productId) => {
        try {
            setActionLoading({...actionLoading, move: productId});
            
            const product = wishlistItems.find(item => item.productId._id === productId)?.productId;
            
            if (!product) {
                setError('Product not found in wishlist');
                return;
            }
            
            if (!product.availability) {
                alert('This product is currently out of stock. You can set a reminder for when it becomes available.');
                return;
            }
            
            const { success, error } = await moveToCart(user._id, productId);
            
            if (success) {
                setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
                alert('Item successfully added to your cart!');
            } else {
                setError(error || 'Failed to add item to cart');
            }
        } catch (err) {
            setError('Failed to move item to cart');
        } finally {
            setActionLoading({...actionLoading, move: null});
        }
    };

    const handleSetReminder = (productId) => {
        setReminderSet(prev => ({ ...prev, [productId]: true }));
        alert('We will notify you when this product is back in stock!');
    };

    const handleClearWishlist = async () => {
        try {
            setActionLoading({...actionLoading, clear: true});
            const { success, error } = await clearWishlist(user._id);
            
            if (success) {
                setWishlistItems([]);
            } else {
                setError(error);
            }
        } catch (err) {
            setError('Failed to clear wishlist');
        } finally {
            setActionLoading({...actionLoading, clear: false});
        }
    };

    const handleRefreshWishlist = async () => {
        await fetchWishlist();
    };

    if (!user) {
        return (
            <div className="wishlist-container unauthorized">
                <h2>My Wishlist</h2>
                <p>Please sign in to view your wishlist</p>
                <Link to="/login" className="auth-link">Sign In</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="wishlist-container loading">
                <h2>My Wishlist</h2>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <h2>My Wishlist</h2>
                <div className="wishlist-actions">
                    {wishlistItems.length > 0 && (
                        <>
                            <button 
                                onClick={handleClearWishlist}
                                disabled={actionLoading.clear}
                                className="clear-btn"
                            >
                                {actionLoading.clear ? 'Clearing...' : 'Clear All'}
                            </button>
                            <button 
                                onClick={handleRefreshWishlist}
                                disabled={loading}
                                className="refresh-btn"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <p>Your wishlist is empty</p>
                    <Link to="/products" className="browse-btn">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="wishlist-items">
                    {wishlistItems.map((item) => {
                        const isOutOfStock = !item.productId.availability;
                        const hasReminder = reminderSet[item.productId._id];
                        
                        return (
                            <div key={item.productId._id} className="wishlist-item">
                                <Link 
                                    to={`/products/${item.productId._id}`}
                                    className="product-link"
                                >
                                    <div className="product-image">
                                        <img 
                                            src={getProductImageUrl(item.productId.image)} 
                                            alt={item.productId.name}
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3>{item.productId.name}</h3>
                                        <p className="price">Rs. {item.productId.price.toFixed(2)}</p>
                                        <p className="category">{item.productId.category}</p>
                                        {isOutOfStock && (
                                            <p className="out-of-stock">Out of Stock</p>
                                        )}
                                    </div>
                                </Link>
                                <div className="item-actions">
                                    <button
                                        onClick={() => isOutOfStock ? 
                                            handleSetReminder(item.productId._id) : 
                                            handleMoveToCart(item.productId._id)}
                                        disabled={actionLoading.move === item.productId._id}
                                        className={`move-btn ${isOutOfStock ? 'set-reminder' : ''}`}
                                    >
                                        {actionLoading.move === item.productId._id ? (
                                            'Processing...'
                                        ) : isOutOfStock ? (
                                            hasReminder ? 'Reminder Set ✓' : 'Notify When Available'
                                        ) : (
                                            'Move to Cart'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleRemoveItem(item.productId._id)}
                                        disabled={actionLoading.remove === item.productId._id}
                                        className="remove-btn"
                                    >
                                        {actionLoading.remove === item.productId._id ? (
                                            'Removing...'
                                        ) : (
                                            'Remove'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;