/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem=thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct=this;

      thisProduct.amountWidget=new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated',function(){
        thisProduct.processOrder();
      });
    }

    initAccordion(){
      const thisProduct=this;

      /* START: add event listener to clickable trigger on event click */
      if (thisProduct.accordionTrigger){
        thisProduct.accordionTrigger.addEventListener('click', function(event) {
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

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        })
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault()
        thisProduct.processOrder();
      })
    }

    processOrder(){
      const thisProduct=this;

      const formData=utils.serializeFormToObject(thisProduct.form);
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

          const optionImage=thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible)
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      price*=thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML=price;
    }
  }

  class AmountWidget {
    constructor (element) {
      const thisWidget=this;
      console.log(thisWidget);
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value ? thisWidget.input.value : settings.amountWidget.defaultValue);
      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;

      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      console.log(thisWidget.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget=this;

      const newValue=parseInt(value);

      if(thisWidget.input.value !== newValue && !isNaN(newValue) && newValue>settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value=newValue;
        thisWidget.input.value=newValue;

        thisWidget.announce();
      } else {
        thisWidget.input.value=thisWidget.value
      }


    }

    initActions(){
      const thisWidget=this;
      console.log(thisWidget.value)

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value)
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

      const event=new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }


  const app = {
    initMenu: function (){
      const thisApp=this;

      for (let productData in thisApp.data.products){
      new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData:function(){
      const thisApp=this;
      thisApp.data=dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
