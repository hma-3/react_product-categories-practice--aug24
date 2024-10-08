/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable function-paren-newline */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const COLUMNS = ['ID', 'Product', 'Category', 'User'];
const OWNER_DEFAULT_VALUE = 'All';
const CATEGORY_DEFAULT_VALUE = 'All';

const getCategory = categoryId =>
  categoriesFromServer.find(category => category.id === categoryId);

const getUser = ownerId => usersFromServer.find(user => user.id === ownerId);

const products = productsFromServer.map(product => {
  const category = getCategory(product.categoryId);
  const user = getUser(category.ownerId);

  return {
    ...product,
    category,
    owner: user,
  };
});

function getVisibleProducts(
  currentProducts,
  { ownerFilter, productNameFilter, categoryNameFilter, sorting },
) {
  let visibleProducts = [...currentProducts];
  const normalizedProductNameFilter = productNameFilter
    .toLocaleLowerCase()
    .trim();

  if (ownerFilter !== OWNER_DEFAULT_VALUE) {
    visibleProducts = visibleProducts.filter(
      ({ owner }) => owner.name === ownerFilter,
    );
  }

  if (normalizedProductNameFilter) {
    visibleProducts = visibleProducts.filter(product => {
      const normalizedProductName = product.name.toLocaleLowerCase().trim();

      return normalizedProductName.includes(normalizedProductNameFilter);
    });
  }

  if (categoryNameFilter.length) {
    visibleProducts = visibleProducts.filter(({ category }) =>
      categoryNameFilter.includes(category.title),
    );
  }

  if (sorting.column) {
    visibleProducts.sort((currentProduct, nextProduct) => {
      let comparisonResult = 0;
      let currentValue = '';
      let nextValue = '';

      switch (sorting.column) {
        case 'ID':
          currentValue = currentProduct.id;
          nextValue = nextProduct.id;
          break;
        case 'Product':
          currentValue = currentProduct.name;
          nextValue = nextProduct.name;
          break;
        case 'Category':
          currentValue = currentProduct.category.title;
          nextValue = nextProduct.category.title;
          break;
        case 'User':
          currentValue = currentProduct.owner.name;
          nextValue = nextProduct.owner.name;
          break;
      }

      if (typeof currentValue === 'string') {
        comparisonResult = currentValue.localeCompare(nextValue);
      } else {
        comparisonResult = currentValue - nextValue;
      }

      return sorting.order === 'asc' ? comparisonResult : comparisonResult * -1;
    })
  }

  return visibleProducts;
}

console.log(products);

export const App = () => {
  const [ownerFilter, setOwnerFilter] = useState(OWNER_DEFAULT_VALUE);
  const [productNameFilter, setProductNameFilter] = useState('');
  const [categoryNameFilter, setCategoryNameFilter] = useState([]);
  const [sorting, setSorting] = useState({
    column: null,
    order: null,
  })

  const visibleProducts = getVisibleProducts(products, {
    ownerFilter,
    productNameFilter,
    categoryNameFilter,
    sorting,
  });

  const handleResetFiltersButton = () => {
    setOwnerFilter(OWNER_DEFAULT_VALUE);
    setProductNameFilter('');
    setCategoryNameFilter([]);
  };

  const handleAddCategory = categoryName => {
    setCategoryNameFilter(categories => [...categories, categoryName]);
  };

  const handleRemoveCategory = categoryName => {
    setCategoryNameFilter(categories =>
      categories.filter(selectedCategory => selectedCategory !== categoryName),
    );
  };

  const handleCategoryNameFilter = categoryName => {
    if (categoryNameFilter.includes(categoryName)) {
      handleRemoveCategory(categoryName);
    } else {
      handleAddCategory(categoryName);
    }
  };

  const handleSorting = column => {
    const isColumnSelected = sorting.column === column;

    if (!isColumnSelected) {
      setSorting({ column, order: 'asc' });
    }

    if (isColumnSelected && sorting.order === 'asc') {
      setSorting({ column, order: 'desc' });
    }

    if (isColumnSelected && sorting.order === 'desc') {
      setSorting({ column: null, order: null });
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({
                  'is-active': ownerFilter === OWNER_DEFAULT_VALUE,
                })}
                onClick={() => setOwnerFilter(OWNER_DEFAULT_VALUE)}
              >
                {OWNER_DEFAULT_VALUE}
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': ownerFilter === user.name })}
                  onClick={() => setOwnerFilter(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={productNameFilter}
                  onChange={event =>
                    setProductNameFilter(event.target.value.trimStart())
                  }
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {productNameFilter !== '' && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setProductNameFilter('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': categoryNameFilter.length,
                })}
                onClick={() => setCategoryNameFilter([])}
              >
                {CATEGORY_DEFAULT_VALUE}
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': categoryNameFilter.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => handleCategoryNameFilter(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetFiltersButton}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {COLUMNS.map(column => (
                    <th key={column}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}

                        <a href="#/" onClick={() => handleSorting(column)}>
                          <span className="icon">
                            <i data-cy="SortIcon" className={cn('fas', {
                              'fa-sort': sorting.column !== column,
                              'fa-sort-up': sorting.column === column && sorting.order === 'asc',
                              'fa-sort-down': sorting.column === column && sorting.order === 'desc',
                            })} />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>

                    <td data-cy="ProductCategory">
                      {`${product.category.icon} - ${product.category.title}`}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.owner.sex === 'm',
                        'has-text-danger': product.owner.sex === 'f',
                      })}
                    >
                      {product.owner.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
