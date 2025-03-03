import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element){
      const thisCart=this;

      thisCart.products=[];

      thisCart.getElements(element);
      thisCart.initActions();

    }

    getElements(element){
      const thisCart=this;
      //console.log(element);

      thisCart.dom={};

      thisCart.dom.wrapper=element;

      thisCart.dom.toggleTrigger=thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList=thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.dom.deliveryFee=thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

      thisCart.dom.subtotalPrice=thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

      thisCart.dom.totalNumber=thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      //console.log(thisCart.dom.totalNumber);

      thisCart.dom.totalPrice=thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      //console.log(thisCart.dom.totalPrice)

      thisCart.dom.form=thisCart.dom.wrapper.querySelector(select.cart.form);

      thisCart.dom.address=thisCart.dom.wrapper.querySelector(select.cart.address);

      thisCart.dom.phone=thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions(){
      const thisCart=this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update()
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      })

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();

      })
    }

    add(menuProduct){
      const thisCart=this;

      //console.log(menuProduct);

      const generatedHTML=templates.cartProduct(menuProduct);

      const element=utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(element);

      //console.log(thisCart.element)

      thisCart.products.push(new CartProduct(menuProduct, element));
      //console.log(thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart=this;

      thisCart.deliveryFee=settings.cart.defaultDeliveryFee;
      //console.log(thisCart.deliveryFee)

      thisCart.totalNumber=0;
      thisCart.subtotalPrice=0;

      for (let product of thisCart.products){
        thisCart.totalNumber+=product.amountWidget.value;
        thisCart.subtotalPrice+=product.price
      }

      if(thisCart.products.length===0){
        thisCart.deliveryFee=0
      }

      thisCart.totalPrice=thisCart.subtotalPrice+thisCart.deliveryFee;
      //console.log(thisCart.totalPrice);

      thisCart.dom.deliveryFee.innerHTML=thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML=thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML=thisCart.totalNumber;

      for(let priceElem of thisCart.dom.totalPrice){
        priceElem.innerHTML=thisCart.totalPrice;
      }
    }

    remove(cartProduct){
      const thisCart=this;
      console.log(cartProduct);

      cartProduct.dom.wrapper.remove();

      const index=thisCart.products.indexOf(cartProduct);
      if (index>-1){
        thisCart.products.splice(index,1);
      }

      thisCart.update();
    }

    sendOrder(){
      const thisCart=this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload={
        address:thisCart.dom.address.value,
        phone:thisCart.dom.phone.value,
        totalPrice:thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber:thisCart.totalNumber,
        deliveryFee:thisCart.deliveryFee,
        products:[],
      }

      for (let prod of thisCart.products){
        payload.products.push(prod.getData())
      }

      const options={
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(payload),
      };

      fetch(url,options);
    }
  }

  export default Cart;