
import mongoose from 'mongoose';
import Produit from '../models/produit.js';
import User from '../models/user.js';

const { Schema, model } = mongoose;

const commandeSchema = new Schema(
  {
    selectedProducts: [
      {
        produit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Produit', 
        },
        quantity: Number,
        name: String, // Add title field
        price: Number, // Add price field
        image: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: false,
    },
    paymentMethodId: {
      type: String,
      required: false,
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
  },
  {
    timestamps: true,
  }
);

commandeSchema.pre('save', async function (next) {
  const productsPromises = this.selectedProducts.map(async (product) => {
    try {
      const produit = await Produit.findById(product.produit);

      if (produit) {
        product.title = produit.name;
        product.price = produit.price;
        product.image = produit.image;
      } else {
        // Handle the case where produit is not found
        console.error(`Produit not found for product ID: ${product.produit}`);
      }
    } catch (error) {
      // Handle any other errors that might occur during population
      console.error(`Error populating produit: ${error.message}`);
    }

    return product;
  });

  this.selectedProducts = await Promise.all(productsPromises);

  next();
});



export default model('Commande', commandeSchema);
