function initializeCityAndBranchSearch() {

    let selectedCityRef = null;

    async function fetchCitySuggestions(query) {
      try {
        const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-cities?query=${query}`);
        const cities = await response.json();
        return cities;
      } catch (error) {
        return [];
      }
    }

    async function fetchBranches(cityRef) {
      try {
        const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-branches?cityRef=${cityRef}`);
        const branches = await response.json();
        updateBranchList(branches);
      } catch (error) {
        console.error('Ошибка при получении отделений:', error);
      }
    }

    async function fetchBranchSuggestions(query) {
        if (!selectedCityRef) {
            console.error('Город не выбран');
            return;
        }
        try {
            const response = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-branches?cityRef=${selectedCityRef}&query=${query}`);
            const branches = await response.json();
            updateBranchList(branches);
        } catch (error) {
            console.error('Ошибка при получении отделений:', error);
        }
    }

    function updateBranchList(branches) {
        const branchSuggestions = document.getElementById('branch-suggestions');
        branchSuggestions.innerHTML = '';
        
        if (branches.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('autocomplete-suggestion');
            noResults.textContent = 'Відділея не знайдено';
            branchSuggestions.appendChild(noResults);
        } else {
            branches.forEach(branch => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('autocomplete-suggestion');
                suggestion.textContent = branch.Description;
                suggestion.addEventListener('click', function() {
                    document.getElementById('branch-search').value = branch.Description;
                    branchSuggestions.innerHTML = '';
                });
                branchSuggestions.appendChild(suggestion);
            });
        }
        
        branchSuggestions.style.display = 'block';
    }

    function filterBranches(query) {
        const branchSuggestions = document.getElementById('branch-suggestions');
        const suggestions = branchSuggestions.children;
        let visibleCount = 0;
        
        for (let item of suggestions) {
            if (item.textContent.toLowerCase().includes(query.toLowerCase())) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        }
        
        if (visibleCount === 0) {
            branchSuggestions.innerHTML = '';
            const noResults = document.createElement('div');
            noResults.classList.add('autocomplete-suggestion');
            noResults.textContent = 'Відділення не знайдено';
            branchSuggestions.appendChild(noResults);
        }
        
        branchSuggestions.style.display = 'block';
    }

    const branchSearch = document.getElementById('branch-search');
    if (branchSearch) {
        let branchTypingTimer;
        const branchDoneTypingInterval = 500; // 0.3 секунды

        branchSearch.addEventListener('input', function() {
            const query = this.value.trim();
            clearTimeout(branchTypingTimer);

            if (query.length >= 1 && selectedCityRef) {
                branchTypingTimer = setTimeout(() => fetchBranchSuggestions(query), branchDoneTypingInterval);
            } else {
                document.getElementById('branch-suggestions').innerHTML = '';
            }
        });

        branchSearch.addEventListener('focus', function() {
            document.getElementById('branch-suggestions').style.display = 'block';
        });

        branchSearch.addEventListener('blur', function() {
            setTimeout(() => {
                document.getElementById('branch-suggestions').style.display = 'none';
            }, 200);
        });
    }

    let typingTimer;
    const doneTypingInterval = 500; // 0.5 секунды

    const cityInput = document.getElementById('city');
    if (cityInput) {
      cityInput.addEventListener('input', function() {
        clearTimeout(typingTimer);
        clearBranchSelection();

        const query = this.value.trim();

        if (query.length >= 3) {
          typingTimer = setTimeout(async function() {
            const suggestions = await fetchCitySuggestions(query);
            const suggestionsContainer = document.getElementById('city-suggestions');
            suggestionsContainer.innerHTML = '';

            let exactMatch = false;

            suggestions.forEach(city => {
              const suggestionElement = document.createElement('div');
              suggestionElement.classList.add('autocomplete-suggestion');
              suggestionElement.textContent = city.Description;
              suggestionElement.dataset.ref = city.Ref;

              if (city.Description.toLowerCase() === query.toLowerCase()) {
                exactMatch = true;
                cityInput.value = city.Description;
                selectedCityRef = city.Ref;
                suggestionsContainer.innerHTML = '';
                fetchBranches(city.Ref);
              }

              suggestionElement.addEventListener('click', function() {
                cityInput.value = city.Description;
                selectedCityRef = city.Ref;
                suggestionsContainer.innerHTML = '';
                fetchBranches(city.Ref);
              });

              suggestionsContainer.appendChild(suggestionElement);
            });

            if (exactMatch) {
              suggestionsContainer.innerHTML = '';
            }
          }, doneTypingInterval);
        }
      });
    }

    function clearBranchSelection() {
      const branchSearch = document.getElementById('branch-search');
      if (branchSearch) {
        branchSearch.value = '';
        branchSearch.placeholder = 'Виберіть відділення';
      }
    }

    function highlightEmptyFields() {
      const fields = ['first-name', 'last-name', 'phone', 'city', 'branch-search'];
      let firstEmptyField = null;
      
      fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && !field.value.trim()) {
          field.classList.add('input-error');
          if (!firstEmptyField) {
            firstEmptyField = field;
          }
        }
      });

      if (firstEmptyField) {
        firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setTimeout(() => {
        document.querySelectorAll('.input-error').forEach(el => {
          el.classList.remove('input-error');
        });
      }, 1500);
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

    async function getComment(){
      let comment = document.querySelector('textarea[name="comment"]');
        console.log(comment.value)
        fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              note: comment.value
          }),
        })
        .then(response => response.json())
        .catch(error => {
          console.error('Ошибка:', error);
        });
    };

    async function handleCheckoutClick() {
      
      const fields = {
        city: document.getElementById('city').value.trim(),
        branch: document.getElementById('branch-search').value.trim(), 
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
        await getComment()
        const params = new URLSearchParams({
          'checkout[shipping_address][first_name]': fields.firstName,
          'checkout[shipping_address][last_name]': fields.lastName,
          'checkout[shipping_address][address1]': fields.branch,
          'checkout[shipping_address][city]': fields.city,
          'checkout[phone]': fields.phone,
          'checkout[shipping_address][zip]': fields.zip,
        });

        const checkoutUrl = `/checkout?${params.toString()}`;

        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 200);
      } else {
        highlightEmptyFields();
      }
    }
};
