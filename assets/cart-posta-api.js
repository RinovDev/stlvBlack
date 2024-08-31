document.addEventListener('DOMContentLoaded', function() {
  //НОВАЯ ПОЧТА АПИ//
  ////////////////////
  // Асинхронная функция для получения предложений городов
  async function fetchCitySuggestions(query) {
    try {
      const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-cities?query=${query}`);
      const cities = await response.json();
      return cities;
    } catch (error) {
      return [];
    }
  }

  // Функция для получения почтоматов по городу
  async function fetchBranches(cityRef) {
    try {
      const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-branches?cityRef=${cityRef}`);
      const branches = await response.json();

      const branchItems = document.getElementById('branch-items');
      branchItems.innerHTML = ''; // Очистка существующих элементов

      branches.forEach(branch => {
        const div = document.createElement('div');
        div.textContent = branch.Description;
        div.addEventListener('click', function(e) {
          e.stopPropagation();
          updateBranchSelection(this.textContent);
        });
        branchItems.appendChild(div);
      });
    } catch (error) {
      // Обработка ошибки
    }
  }

  let isDropdownOpen = false;
  // Функция для открытия выпадающего списка
  function openDropdown() {
    document.getElementById('branch-items').style.display = 'block';
    document.querySelector('.select-selected').classList.add('select-arrow-active');
    isDropdownOpen = true;
  }

  // Функция для закрытия выпадающего списка
  function closeDropdown() {
    document.getElementById('branch-items').style.display = 'none';
    document.querySelector('.select-selected').classList.remove('select-arrow-active');
    isDropdownOpen = false;
  }

  // Обработчик клика для открытия/закрытия выпадающего списка
  const selectElement = document.querySelector('.select-selected');
  if (selectElement) {
    selectElement.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isDropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
  }

  // Обработчик клика по документу для закрытия выпадающего списка при клике вне его
  document.addEventListener('click', function(e) {
    if (isDropdownOpen && !e.target.closest('.custom-select')) {
      closeDropdown();
    }
  });

  // Обработчик ввода в поле города для получения предложений
  const cityInput = document.getElementById('city');
  if (cityInput) {
    cityInput.addEventListener('input', async function() {
      const query = this.value;

      // Осуществляем запрос только если введено 3 и более символов
      if (query.length >= 3) {
        const suggestions = await fetchCitySuggestions(query);

        const suggestionsContainer = document.getElementById('city-suggestions');
        suggestionsContainer.innerHTML = '';

        suggestions.forEach(city => {
          const suggestionElement = document.createElement('div');
          suggestionElement.classList.add('autocomplete-suggestion');
          suggestionElement.textContent = city.Description;
          suggestionElement.dataset.ref = city.Ref;

          suggestionElement.addEventListener('click', function() {
            cityInput.value = city.Description;
            suggestionsContainer.innerHTML = '';
            fetchBranches(city.Ref);
          });

          suggestionsContainer.appendChild(suggestionElement);
        });
      }
    });
  }

  // Проверка валидности формы
  function checkFormValidity() {
    const fields = {
      'first-name': 'Імʼя',
      'last-name': 'Призвище',
      'phone': 'Телефон',
      'city': 'Місто',
    };
    
    let isValid = true;
    let emptyFields = [];

    for (let [id, label] of Object.entries(fields)) {
      const field = document.getElementById(id);
      const value = field.value.trim();
      if (!value) {
        isValid = false;
        emptyFields.push(label);
      }
    }

    const branchSelect = document.querySelector('.select-selected');
    const branch = branchSelect.textContent.trim();
    if (branch === 'Виберіть відділення') {
      isValid = false;
      emptyFields.push('Відділення');
    }

    const checkoutButton = document.getElementById('CartDrawer-Checkout');

    if (isValid) {
      checkoutButton.classList.remove('button--disabled');
    } else {
      checkoutButton.classList.add('button--disabled');
    }

    return { isValid, emptyFields };
  }

  // Подсветка пустых полей формы
  function highlightEmptyFields() {
    const fields = ['first-name', 'last-name','phone', 'city'];
    fields.forEach(id => {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        field.classList.add('input-error');
      }
    });

    const branchSelect = document.querySelector('.select-selected');
    if (branchSelect.textContent.trim() === 'Виберіть відділення') {
      branchSelect.classList.add('input-error');
    }

    // Удаление класса input-error после анимации
    setTimeout(() => {
      document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
      });
    }, 1500); // 1500мс (длительность анимации)
  }

  // Обновляем обработчик для выбора отделения
  function updateBranchSelection(branchName) {
    const branchSelect = document.querySelector('.select-selected');
    branchSelect.textContent = branchName;
    closeDropdown();
    document.getElementById('error-message').style.display = 'none';
  }

  const cartDrawer = document.getElementById('CartDrawer');
  if (cartDrawer) {
    cartDrawer.addEventListener('click', function(event) {
      if (event.target && event.target.id === 'CartDrawer-Checkout') {
        event.preventDefault();
        handleCheckoutClick();
      }
    });
  }

  // Обработчик клика по кнопке оформления заказа
  function handleCheckoutClick() {
    const fields = {
      city: document.getElementById('city').value.trim(),
      branch: document.querySelector('.select-selected').textContent.trim(),
      firstName: document.getElementById('first-name').value.trim(),
      lastName: document.getElementById('last-name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      zip: '00012'
    };

    let isValid = true;
    let emptyFields = [];

    // Проверка на пустые поля
    for (let [key, value] of Object.entries(fields)) {
      if (!value) {
        isValid = false;
        emptyFields.push(key);
      }
    }

    if (isValid) {
      const params = new URLSearchParams({
        'checkout[shipping_address][first_name]': fields.firstName,
        'checkout[shipping_address][last_name]': fields.lastName,
        'checkout[shipping_address][address1]': fields.branch,
        'checkout[shipping_address][city]': fields.city,
        'checkout[shipping_address][zip]': fields.zip,
        'checkout[email]': fields.phone,
      });

      const checkoutUrl = `/checkout?${params.toString()}`;

        console.log("City:", fields.city);
        console.log("Branch:", fields.branch);
        console.log("First Name:", fields.firstName);
        console.log("Last Name:", fields.lastName);
        console.log("Phone:", fields.phone);
        console.log("Checkout URL:", checkoutUrl);

      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 500);

    } else {
      highlightEmptyFields();

    }
  }
});
