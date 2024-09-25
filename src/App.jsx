/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const COLUMNS = ['ID', 'Product', 'Category', 'User'];
const OWNER_DEFAULT_VALUE = 'All';

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
  { ownerFilter, nameProductFilter },
) {
  let visibleProducts = [...currentProducts];
  const normalizedNameProductFilter = nameProductFilter
    .toLocaleLowerCase()
    .trim();

  if (ownerFilter !== OWNER_DEFAULT_VALUE) {
    visibleProducts = visibleProducts.filter(
      ({ owner }) => owner.name === ownerFilter,
    );
  }

  if (normalizedNameProductFilter) {
    visibleProducts = visibleProducts.filter(product => {
      const normalizedProductName = product.name.toLocaleLowerCase().trim();

      return normalizedProductName.includes(normalizedNameProductFilter);
    });
  }

  return visibleProducts;
}

export const App = () => {
  const [ownerFilter, setOwnerFilter] = useState(OWNER_DEFAULT_VALUE);
  const [nameProductFilter, setNameProductFilter] = useState('');

  const visibleProducts = getVisibleProducts(products, {
    ownerFilter,
    nameProductFilter,
  });

  const handleResetFiltersButton = () => {
    setOwnerFilter(OWNER_DEFAULT_VALUE);
    setNameProductFilter('');
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
                  value={nameProductFilter}
                  onChange={event =>
                    setNameProductFilter(event.target.value.trimStart())
                  }
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {nameProductFilter !== '' && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setNameProductFilter('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
              >
                All
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 1
              </a>

              <a data-cy="Category" className="button mr-2 my-1" href="#/">
                Category 2
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 3
              </a>
              <a data-cy="Category" className="button mr-2 my-1" href="#/">
                Category 4
              </a>
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

                        {/* <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a> */}
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
