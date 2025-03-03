import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
    constructor(menuProduct,element){
      const thisCartProduct=this;
      //console.log(element);

      thisCartProduct.id=menuProduct.id;
      thisCartProduct.name=menuProduct.name;
      thisCartProduct.amount=menuProduct.amount;
      thisCartProduct.singlePrice=menuProduct.singlePrice;
      thisCartProduct.price=menuProduct.price;
      thisCartProduct.params=menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log(thisCartProduct)
    }

    getElements(element){
      const thisCartProduct=this;

      thisCartProduct.dom={};
      thisCartProduct.dom.wrapper=element;

      thisCartProduct.dom.amountWidget=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      //console.log(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.price=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);

      thisCartProduct.dom.edit=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);

      thisCartProduct.dom.remove=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){
      const thisCartProduct=this;

      thisCartProduct.amountWidget=new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

        thisCartProduct.amount=thisCartProduct.amountWidget.value,

        thisCartProduct.price=thisCartProduct.amount*thisCartProduct.singlePrice;

        thisCartProduct.dom.price.innerHTML=thisCartProduct.price
      })

    }

    initActions(){
      const thisCartProduct=this;

      thisCartProduct.dom.edit.addEventListener('click',function(event){
        event.preventDefault()

      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove()
      })
    }

    remove(){
      const thisCartProduct=this;

      const event =new CustomEvent('remove', {
        bubbles:true,
        detail: {
          cartProduct:thisCartProduct
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

      //console.log(event);
    }

    getData(){
      const thisCartProduct=this;

      return {
        id:thisCartProduct.id,
        name:thisCartProduct.name,
        amount:thisCartProduct.amount,
        price:thisCartProduct.price,
        priceSingle:thisCartProduct.priceSingle,
        params:thisCartProduct.params,
      }

    }
  }

  export default CartProduct;