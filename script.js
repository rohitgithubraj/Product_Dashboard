// Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
      initializeSidebar();
      initializeProductFilters();
      initializeAddProductForm();
      setCurrentDate();
      loadStoredProducts();
      setupMenuToggle();
    });

    // Sidebar Navigation
    function initializeSidebar() {
      const sidebarLinks = document.querySelectorAll('aside .sidebar a');

      sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const linkText = link.querySelector('h3').textContent;

          setActiveLink(link);

          if (linkText === 'Add Product') {
            showAddProductForm();
          } else if (linkText === 'Product Management' || linkText === 'Dashboard') {
            showProductList();
          } else if (linkText === 'Logout') {
            handleLogout();
          }

          // close sidebar on mobile after click
          closeSidebarOnMobile();
        });
      });
    }

    function setActiveLink(activeLink) {
      document.querySelectorAll('aside .sidebar a').forEach(link => {
        link.classList.remove('active');
      });
      activeLink.classList.add('active');
    }

    // Product Filtering
    function initializeProductFilters() {
      const searchInput = document.getElementById('searchInput');
      const categoryFilter = document.getElementById('categoryFilter');
      const availabilityFilter = document.getElementById('availabilityFilter');

      searchInput.addEventListener('input', filterProducts);
      categoryFilter.addEventListener('change', filterProducts);
      availabilityFilter.addEventListener('change', filterProducts);
    }

    function filterProducts() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const categoryValue = document.getElementById('categoryFilter').value;
      const availabilityValue = document.getElementById('availabilityFilter').value;
      const productCards = document.querySelectorAll('.product-card');

      productCards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';
        const availability = card.getAttribute('data-availability') || '';

        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = categoryValue === 'all' || category === categoryValue;
        const matchesAvailability = availabilityValue === 'all' || availability === availabilityValue;

        card.style.display = (matchesSearch && matchesCategory && matchesAvailability) ? 'block' : 'none';
      });
    }

    // Add Product Form
    function initializeAddProductForm() {
      const form = document.getElementById('addProductForm');
      form.addEventListener('submit', handleAddProduct);
    }

    function handleAddProduct(e) {
      e.preventDefault();

      const name = document.getElementById('productName').value.trim();
      const price = document.getElementById('productPrice').value;
      const category = document.getElementById('productCategory').value;
      const availability = document.getElementById('productAvailability').value;

      if (!name || !price || !category) {
        showNotification('Please fill all fields', 'info');
        return;
      }

      const productList = document.getElementById('productList');
      const newCard = document.createElement('div');
      newCard.classList.add('product-card');
      newCard.setAttribute('data-name', name);
      newCard.setAttribute('data-category', category);
      newCard.setAttribute('data-availability', availability);

      const statusClass = availability === 'in-stock' ? 'in-stock' : 'out-of-stock';
      const statusText = availability === 'in-stock' ? 'In Stock' : 'Out of Stock';

      newCard.innerHTML = `
        <h3>${name}</h3>
        <p>$${parseFloat(price).toFixed(2)}</p>
        <span class="status ${statusClass}">${statusText}</span>
      `;

      productList.appendChild(newCard);
      saveProductToStorage({ name, price: parseFloat(price).toFixed(2), category, availability });
      e.target.reset();
      showNotification('Product added successfully!', 'success');

      setTimeout(() => showProductList(), 700);
    }

    // Persistence (localStorage)
    function saveProductToStorage(product) {
      try {
        const stored = JSON.parse(localStorage.getItem('addedProducts') || '[]');
        stored.push(product);
        localStorage.setItem('addedProducts', JSON.stringify(stored));
      } catch (err) {
        console.error('Failed to save product', err);
      }
    }

    function loadStoredProducts() {
      try {
        const stored = JSON.parse(localStorage.getItem('addedProducts') || '[]');
        const productList = document.getElementById('productList');
        stored.forEach(p => {
          const card = document.createElement('div');
          card.classList.add('product-card');
          card.setAttribute('data-name', p.name);
          card.setAttribute('data-category', p.category);
          card.setAttribute('data-availability', p.availability);
          card.innerHTML = `
            <h3>${p.name}</h3>
            <p>$${parseFloat(p.price).toFixed(2)}</p>
            <span class="status ${p.availability === 'in-stock' ? 'in-stock' : 'out-of-stock'}">${p.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}</span>
          `;
          productList.appendChild(card);
        });
      } catch (err) {
        console.error('Failed to load stored products', err);
      }
    }

    // View Management
    function showAddProductForm() {
      document.querySelector('.product').style.display = 'none';
      document.getElementById('addProductSection').style.display = 'block';
    }

    function showProductList() {
      document.querySelector('.product').style.display = 'block';
      document.getElementById('addProductSection').style.display = 'none';
    }

    // Notifications
    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Logout
    function handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        setTimeout(() => window.location.reload(), 1000);
      }
    }

    // Set Current Date
    function setCurrentDate() {
      const dateInput = document.getElementById('dateInput');
      if (dateInput) {
        dateInput.valueAsDate = new Date();
      }
    }

    // Mobile menu toggle
    function setupMenuToggle() {
      const menuBtn = document.getElementById('menu_bar');
      const sidebar = document.getElementById('sidebar');

      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // close when clicking outside on mobile
      document.addEventListener('click', (e) => {
        const isClickInside = sidebar.contains(e.target) || menuBtn.contains(e.target);
        if (!isClickInside && sidebar.classList.contains('open') && window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    }

    function closeSidebarOnMobile() {
      const sidebar = document.getElementById('sidebar');
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    }
