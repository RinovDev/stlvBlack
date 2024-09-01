document.addEventListener('DOMContentLoaded', function() {
  // Асинхронная функция для получения списка городов по запросу
  async function fetchCitySuggestions(query) {
    try {
      const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-cities?query=${query}`);
      const cities = await response.json();
      return cities;
    } catch (error) {
      return [];
    }
  }

  // Асинхронная функция для получения списка отделений по Ref города
  async function fetchBranches(cityRef) {
    try {
      const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-branches?cityRef=${cityRef}`);
      const branches = await response.json();

      const branchItems = document.getElementById('branch-items');
      branchItems.innerHTML = ''; // Очищаем текущий список отделений

      branches.forEach(branch => {
        const div = document.createElement('div');
        div.textContent = branch.Description;
        div.addEventListener('click', function(e) {
          e.stopPropagation(); // Останавливаем всплытие события
          updateBranchSelection(this.textContent);
        });
        branchItems.appendChild(div);
      });
    } catch (error) {
      // Обработка ошибки
    }
  }

  let isDropdownOpen = false; // Переменная для отслеживания состояния выпадающего списка

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

  const selectElement = document.querySelector('.select-selected');
  if (selectElement) {
    // Обработчик клика по кастомному селекту для открытия/закрытия выпадающего списка
    selectElement.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isDropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
  }

  // Закрываем выпадающий список при клике вне его области
  document.addEventListener('click', function(e) {
    if (isDropdownOpen && !e.target.closest('.custom-select')) {
      closeDropdown();
    }
  });

  const cityInput = document.getElementById('city');
  if (cityInput) {
    // Обработчик ввода в поле города
    cityInput.addEventListener('input', async function() {
      // Очищаем поле "Почтомат", если пользователь снова вводит город
      clearBranchSelection();

      const query = this.value.trim();

      if (query.length >= 3) {
        const suggestions = await fetchCitySuggestions(query);
        const suggestionsContainer = document.getElementById('city-suggestions');
        suggestionsContainer.innerHTML = ''; // Очищаем текущий список подсказок

        let exactMatch = false; // Переменная для отслеживания точного совпадения города

        suggestions.forEach(city => {
          const suggestionElement = document.createElement('div');
          suggestionElement.classList.add('autocomplete-suggestion');
          suggestionElement.textContent = city.Description;
          suggestionElement.dataset.ref = city.Ref;

          // Проверка на точное совпадение введенного города с предложением
          if (city.Description.toLowerCase() === query.toLowerCase()) {
            exactMatch = true;
            cityInput.value = city.Description;
            suggestionsContainer.innerHTML = '';
            fetchBranches(city.Ref);
          }

          // Обработчик клика по предложенному городу
          suggestionElement.addEventListener('click', function() {
            cityInput.value = city.Description;
            suggestionsContainer.innerHTML = '';
            fetchBranches(city.Ref);
          });

          suggestionsContainer.appendChild(suggestionElement);
        });

        if (exactMatch) {
          suggestionsContainer.innerHTML = ''; // Очищаем подсказки, если найдено точное совпадение
        }
      }
    });
  }

  // Функция для очистки выбранного почтового отделения
  function clearBranchSelection() {
    const branchSelect = document.querySelector('.select-selected');
    branchSelect.textContent = 'Виберіть відділення';
  }

  // Проверка валидности формы перед отправкой
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

    // Активация или деактивация кнопки Checkout в зависимости от валидности формы
    if (isValid) {
      checkoutButton.classList.remove('button--disabled');
    } else {
      checkoutButton.classList.add('button--disabled');
    }

    return { isValid, emptyFields };
  }

  // Подсветка пустых полей, если форма невалидна
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

    // Убираем подсветку через 1.5 секунды
    setTimeout(() => {
      document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
      });
    }, 1500);
  }

  // Функция для обновления выбранного почтового отделения
  function updateBranchSelection(branchName) {
    const branchSelect = document.querySelector('.select-selected');
    branchSelect.textContent = branchName;
    closeDropdown();
    document.getElementById('error-message').style.display = 'none';
  }

  const cartDrawer = document.getElementById('CartDrawer');
  if (cartDrawer) {
    // Обработчик клика на кнопку Checkout
    cartDrawer.addEventListener('click', function(event) {
      if (event.target && event.target.id === 'CartDrawer-Checkout') {
        event.preventDefault();
        handleCheckoutClick();
      }
    });
  }

  // Обработчик клика на кнопку Checkout
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
        'checkout[email]': fields.phone,
        'checkout[shipping_address][zip]': fields.zip,
       
      });

      const checkoutUrl = `/checkout?${params.toString()}`;

      // Переход на страницу оформления заказа после небольшой задержки
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 500);

    } else {
      highlightEmptyFields(); // Подсветка пустых полей, если форма невалидна
    }
  }
});
