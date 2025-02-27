/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },

  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

  };

  class Product {
    constructor(id, data){
      const thisProduct=this;

      thisProduct.id=id;
      thisProduct.data=data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

    renderInMenu(){
      const thisProduct=this;

      //generate html based on template

      const generatedHTML=templates.menuProduct(thisProduct.data);

      //create element using utils.createElementFromHTML

      thisProduct.element=utils.createDOMFromHTML(generatedHTML);

      //find menu container
      const menuContainer=document.querySelector(select.containerOf.menu);

      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom={};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.dom.priceElem)
      thisProduct.dom.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem=thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct=this;

      thisProduct.amountWidget=new AmountWidget(thisProduct.dom.amountWidgetElem);
      //console.log(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('updated',function(){
        thisProduct.processOrder();
      });
    }

    initAccordion(){
      const thisProduct=this;

      /* START: add event listener to clickable trigger on event click */
      if (thisProduct.dom.accordionTrigger){
        thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
          /* prevent default action for event */
          event.preventDefault();

          /* find active product (product that has active class) */
          const activeProduct=document.querySelector(select.all.menuProductsActive);
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          if(activeProduct && activeProduct!==thisProduct.element){
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
          /* toggle active class on thisProduct.element */
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        });
      }
    }

    initOrderForm(){
      const thisProduct=this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        })
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault()
        thisProduct.processOrder();
        thisProduct.addToCart()
      })
    }

    processOrder(){
      const thisProduct=this;

      const formData=utils.serializeFormToObject(thisProduct.dom.form);
      //console.log(thisProduct.form);
      //console.log('formData: ', formData);

      let price=thisProduct.data.price;

      for ( let paramId in thisProduct.data.params){
        const param=thisProduct.data.params[paramId];
        //console.log(paramId);
        //console.log(param);

        for (let optionId in param.options){
          const option=param.options[optionId];
          //console.log(optionId);
          //console.log(option);

          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected){
            if(!option.default){
              price=price+option.price
            }
          } else {
            if(option.default){
              price=price-option.price
            }
          }

          const optionImage=thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible)
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle=price;

      price*=thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML=price;


    }

    addToCart(){
      const thisProduct=this;

      app.cart.add(thisProduct.prepareCartProduct());

    }

    prepareCartProduct(){
      const thisProduct=this;

      const productSummary={
        id:thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        singlePrice:thisProduct.priceSingle,
        price:thisProduct.priceSingle*thisProduct.amountWidget.value,
        params:(thisProduct.prepareCartProductParams()),
      }
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct=this;

      const formData=utils.serializeFormToObject(thisProduct.dom.form);
      const params={};

      for ( let paramId in thisProduct.data.params){
        const param=thisProduct.data.params[paramId];

        params[paramId]={
          label:param.label,
          options:{}
        }

        for (let optionId in param.options){
          const option=param.options[optionId];
          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected){
            params[paramId].options[optionId]=option.label

          }
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor (element) {
      const thisWidget=this;
      //console.log(thisWidget);
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);

      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      //console.log(element);

      thisWidget.dom={};

      thisWidget.dom.input = thisWidget.element.querySelector(select.widgets.amount.input);
      //console.log(thisWidget.dom.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      //console.log(thisWidget.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget=this;

      const newValue=parseInt(value);
      //console.log(value)

     if(thisWidget.dom.input){
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue>= settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value=newValue;
        thisWidget.dom.input.value=newValue;

        thisWidget.announce();
      } else {
        thisWidget.dom.input.value=thisWidget.value;
      }
     }

      //console.log(thisWidget.value)
    }

    initActions(){
      const thisWidget=this;

      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.dom.input.value)
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1)
      })
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      })
    }

    announce(){
      const thisWidget=this;

      const event=new CustomEvent('updated', {
        bubbles:true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

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

  const app = {
    initMenu: function (){
      const thisApp=this;

      for (let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData:function(){
      const thisApp=this;
      thisApp.data={};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          //console.log(parsedResponse)

          /* save parsedResponse as thisApp.data.products */

          thisApp.data.products=parsedResponse;

          /* execute initMenu method */

          thisApp.initMenu();
        })

        //console.log(JSON.stringify(thisApp.data));
    },
    initCart:function(){
      const thisApp=this;
      const cartElem=document.querySelector(select.containerOf.cart);

      //mozemy wywolac cart poza obiektem app
      thisApp.cart=new Cart(cartElem);
    },



    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };
  app.init();
}


