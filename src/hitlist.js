/**
 * Created by MariaSo on 15/11/2016.
 */

import TableFloatingHeader from "r-table-floating-header/src/table-floating-header";

var HitlistStyle = require('./hitlist.css');

class Hitlist {

  constructor(options) {
    let {
      separator = ' ',
      typeOfCategoriesChips,
      hitlist,
      headers,
      hitlistData,
      icons = {
        "positive": `<div class="icon">
                  <svg class="cf_positive" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15.5" cy="9.5" r="1.5"></circle>
                    <circle cx="8.5" cy="9.5" r="1.5"></circle>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z"></path>
                  </svg>
                </div>`,
        "neutral": `<div class="icon">
                 <svg class="cf_neutral" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                   <path d="M9 14h6v1.5H9z"></path>
                   <circle cx="15.5" cy="9.5" r="1.5"></circle>
                   <circle cx="8.5" cy="9.5" r="1.5"></circle>
                   <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                 </svg>
                </div>`,
        "negative": `<div class="icon">
                  <svg class="cf_negative" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="15.5" cy="9.5" r="1.5"></circle>
                     <circle cx="8.5" cy="9.5" r="1.5"></circle>
                     <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z"></path>
                  </svg>
                </div>`
      }, sentimentConfig = [{
      sentiment: "positive",
      icon: icons.positive,
      range: {min: 2, max: 5}
    }, {
      sentiment: "neutral",
      icon: icons.neutral,
      range: {min: -1, max: 1}
    }, {
      sentiment: "negative",
      icon: icons.negative,
      range: {min: -5, max: -2}
    }]
    }=options;

    this.source = hitlist;
    this.headers = headers;
    this.hitlistData = hitlistData;
    this.sentimentConfig = sentimentConfig;
    this.icons = icons;

    this.processHeadersConfig();
    this.movePaginationToTheMainHeader(hitlist);
    Hitlist.processSortableColumns(hitlist);
    Hitlist.processDates(hitlist);
    this.processMainColumn(typeOfCategoriesChips, separator);
    this.addIconsForSentiment();

    if (!this.source.querySelector('.aggregatedTableContainer')) {
      this.fixedHeader = new TableFloatingHeader(this.source.querySelector('table'));
    } else { // hack to get pagination text and update an already initialised header since we'd need that new text on hitlist update
      this.source.querySelector('table.fixed>thead').innerHTML = this.source.querySelector('table:not(.fixed)>thead').innerHTML;
      let offset = this.source.querySelector('table:not(.fixed)').parentNode.offsetTop;
      Hitlist.scrollTo(offset, 200);
    }
  }

  //TODO: make scrollTO reusable across scripts
  /**
   * Implements smooth srolling
   * @param {Number} to - offset from top of the page the window needs to be scrolled to
   * @param {Number} duration - auxiliary parameter to specify scroll duration and implement easing
   * */
  static scrollTo(to, duration) {
    let start = window.pageYOffset || document.documentElement.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    let animateScroll = function () {
      currentTime += increment;
      let val = easeInOutQuad(currentTime, start, change, duration);
      window.scrollTo(0, val);
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
  }


  processHeadersConfig() {
    [
      {type: "verbatim", postfix: "verbatim"},
      {type: "categories", postfix: "categories"},
      {type: "date", postfix: "date"},
      {type: "sentiment", postfix: "sentiment"}
    ].forEach(type => {
      if (this.headers[type.type] && this.headers[type.type].length > 0)
        this.headers[type.type].forEach(question => {
          Hitlist.addClassesToHitlist(this.source, question, type);
          Hitlist.changeTitles(this.source, question);
        })
    });
  }

  movePaginationToTheMainHeader(source) {
    let mainHeader = source.querySelector(".yui3-datatable-header.reportal-hitlist-main"),
      title = mainHeader.innerText;
    mainHeader.innerHTML = "";
    let paginationText = [title, this.source.getElementsByClassName("hitlist-pagination-count")[0].innerText.replace("(", "of ").slice(0, -1)].join(" ");
    let paginationElement = document.createElement("span");
    paginationElement.innerText = paginationText;
    mainHeader.appendChild(paginationElement);
  }

  addIconsForSentiment() {
    let sentimentCells = this.source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-sentiment");
    if (sentimentCells && sentimentCells.length > 0) {
      [].slice.call(sentimentCells).forEach(cell => this.addIconForSentiment(cell));
    }

  }

  addIconForSentiment(cell) {
    let value = parseInt(cell.innerText);
    for (let i = 0; i < this.sentimentConfig.length; i++) {
      if (value <= this.sentimentConfig[i].range.max && value >= this.sentimentConfig[i].range.min) {
        cell.innerHTML = this.sentimentConfig[i].icon ? this.sentimentConfig[i].icon : this.icons[this.sentimentConfig[i].sentiment];
      }
    }
  }

  processMainColumn(typeOfCategoriesChips, separator) {
    let mainCells = this.source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-main");
    [].slice.call(mainCells).forEach((cell, index) => {
      Hitlist.wrapComment(cell);
      //this.addDateToComment(cell, index);
      if (this.headers["categories"]) {
        switch (typeOfCategoriesChips) {
          case 'removeMainCategories':
            Hitlist.addCategoriesToComment__removeMainCategories(this.source, cell, index);
            break;
          case 'addEllipsis':
            Hitlist.addCategoriesToComment__addEllipsis(this.source, cell, index, separator);
            break;
          case 'addEllipsisWithHover':
            Hitlist.addCategoriesToComment__addEllipsisWithHover(this.source, cell, index, separator);
            break;
          case 'tree':
            Hitlist.addCategoriesToComment__tree(this.source, cell, index, separator);
            break;
          default:
            Hitlist.addCategoriesToComment(this.source, cell, index);
            break;
        }

      }
    });
  }

  static addClassesToHitlist(source, question, type) {
    let questionCells = source.querySelectorAll(".yui3-datatable-col-" + question.name);
    [].slice.call(questionCells).forEach(item => {
        item.classList.add("reportal-hitlist-" + type.postfix);
        if (question.main)
          item.classList.add("reportal-hitlist-main");
      }
    )
  }

  static changeTitles(source, question) {
    if (question.title) {
      source.querySelector(".yui3-datatable-header.yui3-datatable-col-" + question.name).innerHTML = question.title;
    }
  }


  static processSortableColumns(source) {
    let sortableColumns = source.querySelectorAll(".yui3-datatable-header.yui3-datatable-sortable-column");
    if (sortableColumns) [].slice.call(sortableColumns).forEach(header => Hitlist.addSorting(header));
  }

  static addSorting(header) {
    let dateSortingElement = document.createElement("span");
    dateSortingElement.innerText = header.innerText;
    dateSortingElement.classList.add("sortable");
    dateSortingElement.classList.remove("waiting");
    Hitlist.toggleSorting(dateSortingElement, header);
    header.innerHTML = "";
    header.appendChild(dateSortingElement);
    dateSortingElement.addEventListener("click", (event) => {
      dateSortingElement.classList.add("waiting");
      dateSortingElement.classList.remove("sorted");
    });
  }

  static toggleSorting(targetElement, sourceElement = targetElement) {
    if (sourceElement.classList.contains("yui3-datatable-sortable-column") && sourceElement.classList.contains("yui3-datatable-sorted")) {
      targetElement.classList.add("sorted");
      if (sourceElement.getAttribute("aria-sort") == "ascending") {
        targetElement.classList.add("asc");
        targetElement.classList.remove("desc");
      } else {
        targetElement.classList.add("desc");
        targetElement.classList.remove("asc");
      }
    }
  }


  static processDates(source) {
    let dateCells = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-date");
    if (dateCells) [].slice.call(dateCells).forEach((cell, index) => {
      let date = cell.innerText;
      cell.innerHTML = "";
      let dateElement = document.createElement("div");
      dateElement.innerText = date;
      dateElement.classList.add("hitlist-date-info");
      cell.insertBefore(dateElement, cell.firstChild);
    });
  }

  static wrapComment(cell) {
    let comment = document.createElement("div");
    comment.innerText = cell.innerText;
    cell.innerHTML = "";
    cell.appendChild(comment)
  }

  static addCategoriesToComment(source, cell, index) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");
    let categoriesContainer = document.createElement("div");
    categories.forEach(category => {
      categoriesContainer.appendChild(Hitlist.createCategoryCard(category));
    });
    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);
  }

  static createCategoryCard(category) {
    let categoryCard = document.createElement("span");
    categoryCard.innerText = category;
    categoryCard.classList.add("hitlist-tag");
    return categoryCard
  }

  static addCategoriesToComment__removeMainCategories(source, cell, index) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");
    let categoriesFiltered = [];
    categories.forEach((category, index) => {
      if (!categories.find((categoryInner, indexInner) => categoryInner.startsWith(category) && indexInner != index)) {
        categoriesFiltered.push(category);
      }
    });

    let categoriesContainer = document.createElement("div");
    categoriesFiltered.forEach(category => {
      categoriesContainer.appendChild(Hitlist.createCategoryCard(category));
    });
    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);
  }

  static addCategoriesToComment__addEllipsis(source, cell, index, separator) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");
    let main = [];

    categories
      .map(fullNameCategory => fullNameCategory.split(separator).map(category => category.trim()))
      .sort((first, second) => first.length - second.length)
      .forEach(categoryArray => Hitlist.pushCategory(main, categoryArray, separator));

    let categoriesContainer = document.createElement("div");
    main.forEach(item => {
      categoriesContainer.appendChild(Hitlist.createCategoryCard(item.name));
      Hitlist.createCards(item.children, categoriesContainer);
    });

    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);
  }

  static pushCategory(main, categoryArray, separator) {
    if (categoryArray.length == 1) {
      main.push({name: categoryArray[0], children: []});
    } else {
      const currentCategory = categoryArray.shift();
      const parent = main.find(cat => cat.name == currentCategory);
      if (parent) {
        Hitlist.pushCategory(parent.children, categoryArray, separator)
      } else {
        main.push({name: [currentCategory, ...categoryArray].join(` ${separator} `), children: []});
      }
    }
  }

  static createCards(main, categoriesContainer) {
    main.forEach(item => {
      categoriesContainer.appendChild(Hitlist.createCategoryCard(`...${item.name}`));
      Hitlist.createCards(item.children, categoriesContainer);
    });
  }

  static addCategoriesToComment__addEllipsisWithHover(source, cell, index, separator) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");
    let main = [];

    categories
      .map(fullNameCategory => ({
        fullNameCategory,
        categories: fullNameCategory.split(separator).map(category => category.trim())
      }))
      .sort((first, second) => first.categories.length - second.categories.length)
      .forEach(categoryObject => Hitlist.pushCategory_addEllipsisWithHover(main, categoryObject, separator));

    let categoriesContainer = document.createElement("div");

    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);

    main.forEach(item => {
      categoriesContainer.appendChild(Hitlist.createCategoryCard(item.name));
      Hitlist.createCards_addEllipsisWithHover(item.children, categoriesContainer);
    });
  }

  static pushCategory_addEllipsisWithHover(main, categoryObject, separator) {
    if (categoryObject.categories.length == 1) {
      main.push({
        name: categoryObject.categories[0],
        fullName: categoryObject.fullNameCategory,
        children: []
      });
    } else {
      const currentCategory = categoryObject.categories.shift();
      const parent = main.find(cat => cat.name == currentCategory);
      if (parent) {
        Hitlist.pushCategory_addEllipsisWithHover(parent.children, categoryObject, separator)
      } else {
        main.push({
          name: [currentCategory, ...categoryObject.categories].join(` ${separator} `),
          fullName: categoryObject.fullNameCategory,
          children: []
        });
      }
    }
  }

  static createCards_addEllipsisWithHover(main, categoriesContainer) {
    main.forEach(item => {
      const categoryCard = Hitlist.createCategoryDiv(item.fullName.substring(0, item.fullName.length - item.name.length), item.name);
      categoriesContainer.appendChild(categoryCard);
      Hitlist.createCards_addEllipsisWithHover(item.children, categoriesContainer);
    });
  }

  static createCategoryDiv(mainCategoty, category) {
    const mainCategoryCard = document.createElement("span");
    mainCategoryCard.innerText = mainCategoty;
    const width = Hitlist.getWidth(mainCategoryCard);

    const categoryCard = document.createElement("span");
    categoryCard.innerText = category;

    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("hitlist-tag");
    categoryDiv.classList.add("hitlist-tag-container");
    categoryDiv.appendChild(mainCategoryCard);
    categoryDiv.appendChild(categoryCard);

    categoryDiv.onmouseover = () => {
      mainCategoryCard.style.width = width;
    };

    categoryDiv.onmouseout = () => {
      mainCategoryCard.style.width = '';
    };


    return categoryDiv
  }

  static getWidth(element) {
    //const styles = window.getComputedStyle(element, null);

    const newElement = element.cloneNode(true);
    newElement.style.position = 'absolute';
    newElement.style.top = 0;
    newElement.style.left = '-1000px';
    // TODO: count these things from element
    newElement.style.fontFamily = 'verdana, arial, sans-serif'; //styles.getPropertyValue('font-family');
    newElement.style.fontSize = '12px'; //styles.getPropertyValue('font-size');

    document.body.appendChild(newElement);
    const width = (newElement.clientWidth + 5) + 'px';
    document.body.removeChild(newElement);

    return width;
  }


/*  static addCategoriesToComment__tree(source, cell, index, separator) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");

    let main = [];
    categories
      .map(categoryArray => categoryArray.split(separator).map(category => category.trim()))
      .sort((first, second) => first.length - second.length)
      .forEach(categoryArray => Hitlist.pushCategoryWithLevel(main, categoryArray, separator, 0));

    let categoriesContainer = document.createElement("div");
    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);

    main.forEach(category => {
      const groupContainer = document.createElement("div");
      groupContainer.classList.add("hitlist-tags-group");

      const mainCategoryCard = Hitlist.createCategoryCard(category.name);
      mainCategoryCard.classList.add("hitlist-tag");
      groupContainer.appendChild(mainCategoryCard);
      categoriesContainer.appendChild(groupContainer);

      const children = Hitlist.createCardsWithLevel(category.children, groupContainer);
      if (children.length <= 0) {
        mainCategoryCard.classList.add('single-category');
      } else {
        mainCategoryCard.classList.add('category-with-children');
        mainCategoryCard.classList.add('category-with-children--collapsed');
        mainCategoryCard.onclick = () => {
          // TODO: make it work for more than 3 levels
          if (mainCategoryCard.classList.contains('category-with-children--collapsed')) {
            children.forEach(item => item.classList.remove('hidden-category'));
          } else {
            [].forEach.call(mainCategoryCard.parentNode.childNodes, item => {
              if (item !== mainCategoryCard) {
                item.classList.add('hidden-category');
                if (item.classList.contains('category-with-children')) {
                  item.classList.add('category-with-children--collapsed');
                }
              }
            });
          }

          mainCategoryCard.classList.toggle('category-with-children--collapsed');
        }
      }

      mainCategoryCard.style.width = mainCategoryCard.offsetWidth + 'px';
      mainCategoryCard.style.transition = 'all 0.3s ease-in-out';
    });
  }

  static pushCategoryWithLevel(main, categoryArray, separator, level) {
    if (categoryArray.length == 1) {
      const name = categoryArray[0];
      main.push({name, children: [], level});
    } else {
      const currentCategory = categoryArray.shift();
      const parent = main.find(cat => cat.name == currentCategory);
      if (parent) {
        Hitlist.pushCategoryWithLevel(parent.children, categoryArray, separator, level + 1)
      } else {
        const name = [currentCategory, ...categoryArray].join(` ${separator} `);
        main.push({name, children: [], level});
      }
    }
  }

  // TODO: make it work for more than 3 levels
  static createCardsWithLevel(main, container) {
    const children = [];

    main.forEach(item => {
      const categoryCard = Hitlist.createCategoryCardWithLevel(item.name, item.level);
      children.push(categoryCard);
      container.appendChild(categoryCard);
      const innerChildren = Hitlist.createCardsWithLevel(item.children, container);

      if (innerChildren.length <= 0) {
        categoryCard.classList.add('single-category');
      } else {
        categoryCard.classList.add('category-with-children');
        categoryCard.classList.add('category-with-children--collapsed');
        categoryCard.onclick = () => {
          innerChildren.forEach(item => item.classList.toggle('hidden-category'));
          categoryCard.classList.toggle('category-with-children--collapsed');
        }
      }

      categoryCard.style.width = categoryCard.offsetWidth + 'px';
      categoryCard.classList.add('hidden-category');
      categoryCard.style.transition = 'all 0.3s ease-in-out';
    });

    return children;
  }

  static createCategoryCardWithLevel(category, level) {
    let categoryCard = document.createElement("span");
    categoryCard.innerText = category;
    categoryCard.classList.add("hitlist-tag");
    categoryCard.classList.add('sub-category-card');
    //categoryCard.classList.add('hidden-category');
    categoryCard.style.marginLeft = (20 * level) + 'px';
    return categoryCard
  }*/

  static addCategoriesToComment__tree(source, cell, index, separator) {
    let categories = source.querySelectorAll(".yui3-datatable-cell.reportal-hitlist-categories")[index].innerText.split(", ");

    let main = [];
    categories
      .map(categoryArray => categoryArray.split(separator).map(category => category.trim()))
      .sort((first, second) => first.length - second.length)
      .forEach((categoryArray, index) => Hitlist.pushCategoryWithLevel(main, categoryArray, separator, 0, index));

    let categoriesContainer = document.createElement("div");
    categoriesContainer.classList.add("hitlist-tags-container");
    cell.appendChild(categoriesContainer);

    Hitlist.createCardsForTree(main, categoriesContainer);
  }

  static pushCategoryWithLevel(main, categoryArray, separator, level, index) {
    if (categoryArray.length == 1) {
      const name = categoryArray[0];
      main.push({name, children: [], level, id: index + '_' + level});
    } else {
      const currentCategory = categoryArray.shift();
      const parent = main.find(cat => cat.name == currentCategory);
      if (parent) {
        Hitlist.pushCategoryWithLevel(parent.children, categoryArray, separator, level + 1, index)
      } else {
        const name = [currentCategory, ...categoryArray].join(` ${separator} `);
        main.push({name, children: [], level, id: index + '_' + level});
      }
    }
  }

  static createCardsForTree(main, categoryContainer) {
    let container = categoryContainer;

    main.forEach(category => {
      // Create container for one category stack
      if (category.level == 0) {
        const groupContainer = document.createElement("div");
        container = groupContainer;
        groupContainer.classList.add("hitlist-tags-group");
        categoryContainer.appendChild(groupContainer);
      }

      const categoryCard = Hitlist.createCategoryCardWithLevel(category.name, category.level, category.id);
      categoryCard.classList.add("hitlist-tag");
      container.appendChild(categoryCard);

      const children = Hitlist.createCardsForTree(category.children, container);
      if (children.length <= 0) {
        categoryCard.classList.add('single-category');
      } else {
        categoryCard.classList.add('category-with-children');
        categoryCard.classList.add('category-with-children--collapsed');



        /*categoryCard.onclick = () => {
          if (categoryCard.classList.contains('category-with-children--collapsed')) {
            const children = [];
          } else {
            [].forEach.call(categoryCard.parentNode.childNodes, item => {
              if (item !== categoryCard) {
                item.classList.add('hidden-category');
                if (item.classList.contains('category-with-children')) {
                  item.classList.add('category-with-children--collapsed');
                }
              }
            });
          }

          categoryCard.classList.toggle('category-with-children--collapsed');
        };

        categoryCard.onclick = () => {
          innerChildren.forEach(item => item.classList.toggle('hidden-category'));
          categoryCard.classList.toggle('category-with-children--collapsed');
        };*/



      }
      categoryCard.style.width = categoryCard.offsetWidth + 'px';
      /*if (category.level > 0) {
        categoryCard.classList.add('hidden-category');
      }*/
      categoryCard.style.transition = 'all 0.3s ease-in-out';
    });
  }

  static createCategoryCardWithLevel(category, level, id) {
    let categoryCard = document.createElement("span");
    categoryCard.innerText = category;
    categoryCard.classList.add("hitlist-tag");
    categoryCard.style.marginLeft = (20 * level) + 'px';
    categoryCard.setAttribute('data-id', id);
    return categoryCard
  }
}

export default Hitlist;
