import Comment from '../models/comment.js';
import { validationResult } from "express-validator";


// Add a comment to a post
export const addComment = async (req, res) => {
    const userId = req.user.userId;
    console.log(req.params.postId, userId, req.body.content) // Current user
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        const newComment = new Comment({
            postId: req.params.postId,
            userId: userId,
            comment: req.body.comment,
        });

        try {
            const savedComment = await newComment.save();
            res.status(201).send({ message : "Comment added successfully"});     
        } catch (error) {
            res.status(500).send({ message : "Error adding comment"}); 
        }
    }
};

export const getCommentsByPost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.userId;
    console.log(userId)
    try {
        const comments = await Comment.find({ postId: postId })
            .populate('userId', 'firstName lastName image') // Populate only specific fields
            .lean();
        const formattedComments = comments.map(comment => {
            return {
                idUser: userId, 
                idPost: postId, 
                idComment: comment._id,
                commentAvatar: comment.userId.image,
                commentUsername: `${comment.userId.firstName} ${comment.userId.lastName}`,
                comment: comment.comment
            };
        }).filter(comment => comment !== null); // Filter out null comments

        res.json(formattedComments);

    } catch (error) {
        console.error('Error getting comments for post:', error);
        res.status(500).send('Error getting comments');
    }
};


export const getCommentsByIdPost = async (postId) => {
    try {
        const comments = await Comment.find({ postId: postId })
            .populate('userId', 'userId firstName lastName image') // Populate only specific fields
            .lean();
        return comments.map(comment => {
            return {
                idUser: comment.userId._id,
                idPost: comment.postId._id,
                idComment : comment._id,
                commentAvatar: comment.userId.image,
                commentUsername: `${comment.userId.firstName} ${comment.userId.lastName}`,
                comment: comment.comment
            };
        });
            
    } catch (error) {
        console.error('Error getting comments for post:', error);
        return []; // Return an empty array on error
    }
};


// Update a specific comment
export const updateComment = async (req, res) => {
    const { commentId } = req.params;
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        try {
            const updatedComment = await Comment.findByIdAndUpdate(commentId, req.body, { new: true });
            res.status(200).json(updatedComment);
        } catch (error) {
            res.status(500).json({ message: 'Error updating comment', error });
        }
    }
};

// Delete a specific comment
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        return res.status(400).json({ error: "Comment ID is required." });
    }
    try {
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};
