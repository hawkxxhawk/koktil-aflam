// Import the search functions and pagination functions
import { searchFunctions } from './search-handler.js';
import { paginationFunctions } from './pagination-handler.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize FastClick to eliminate 300ms delay on click events
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }
  
  // Prevent pull-to-refresh on older Android browsers
  document.body.addEventListener('touchmove', function(e) {
    if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
    }
  }, { passive: false });
});

new Vue({
  el: '#app',
  data: {
    isLoggedIn: true,
    password: '',
    showSettings: false,
    showPasswordPrompt: false,
    selectedCategory: 'all',
    isBulkAdd: false,
    bulkMovies: {
      titles: '',
      images: '',
      mainLinks: '',
      alternativeLinks: ''
    },
    newMovie: {
      title: '',
      image: '',
      mainLink: '',
      alternativeLink: '',
      category: 'arabicNew',
      type: 'movie'
    },
    movies: [
      {
        id: 1,
        title: 'فيلم عربي جديد',
        year: '2024',
        image: 'https://via.placeholder.com/300x450',
        mainLink: 'https://example.com/movie1',
        alternativeLink: 'https://example.com/movie1-alt',
        category: 'arabicNew',
        hidden: false,
        featured: false
      },
      {
        id: 2,
        title: 'فيلم عربي قديم',
        year: '1980',
        image: 'https://via.placeholder.com/300x450',
        mainLink: 'https://example.com/movie2',
        alternativeLink: '',
        category: 'arabicOld',
        hidden: false,
        featured: false
      },
      {
        id: 3,
        title: 'Foreign Movie',
        year: '2023',
        image: 'https://via.placeholder.com/300x450',
        mainLink: 'https://example.com/movie3',
        alternativeLink: '',
        category: 'foreign',
        hidden: false,
        featured: false
      },
      {
        id: 4,
        title: 'R Movie',
        year: '2023',
        image: 'https://via.placeholder.com/300x450',
        mainLink: 'https://example.com/movie4',
        alternativeLink: '',
        category: 'rMovies',
        hidden: false,
        featured: false
      }
    ],
    categories: [
      { id: 'all', name: 'جميع الأفلام والمسلسلات' },
      { id: 'arabicOld', name: 'أفلام عربية قديمة' },
      { id: 'arabicNew', name: 'أفلام عربية جديدة' },
      { id: 'foreign', name: 'أفلام أجنبية 1' },
      { id: 'foreign2', name: 'أفلام أجنبية 2' },
      { id: 'horror', name: 'أفلام الرعب' },
      { id: 'movieSeries', name: 'سلاسل الأفلام' },
      { id: 'starSeries', name: 'سلاسل النجوم' },
      { id: 'series', name: 'المسلسلات' },
      { id: 'rMovies', name: 'أفلام R', hidden: false },
      { id: 'sMovies', name: 'أفلام S', hidden: false },
      { id: 'featured', name: 'الأفلام المختارة' },
      { id: 'rsSelected', name: 'المختارة R + S', hidden: false },
    ],
    showJsonParser: false,
    jsonInput: '',
    parsedData: {
      titles: '',
      images: '',
      mainLinks: ''
    },
    settingsCategory: 'arabicNew',
    showDeleteConfirm: false,
    deleteTarget: null, // 'all' or category id
    searchQuery: '',
    searchResults: [],
    isSearchActive: false,
    currentPage: 1,
    moviesPerPage: 50,
  },
  computed: {
    visibleMovies() {
      let filtered = this.movies.filter(movie => !movie.hidden);
      
      // Don't show movies from hidden categories
      const hiddenCategories = this.categories
        .filter(cat => cat.hidden)
        .map(cat => cat.id);
      
      filtered = filtered.filter(movie => !hiddenCategories.includes(movie.category));
      
      if (this.selectedCategory === 'featured') {
        filtered = filtered.filter(movie => movie.featured);
      } else if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(movie => movie.category === this.selectedCategory);
        
        // Apply domain ordering if available for this category
        const categoryDomainOrder = this.getCategoryDomainOrder(this.selectedCategory);
        if (categoryDomainOrder && categoryDomainOrder.length > 0) {
          filtered = this.orderMoviesByDomain(filtered, categoryDomainOrder);
        }
      }
      return filtered;
    },
    
    visibleCategories() {
      return this.categories.filter(cat => !cat.hidden);
    },
    moviesByCategory() {
      const categorized = {};
      this.categories.forEach(category => {
        if (category.id !== 'all') {
          categorized[category.id] = this.movies.filter(movie => 
            movie.category === category.id
          );
        }
      });
      return categorized;
    },

    selectedCategoryMovies() {
      return this.moviesByCategory[this.settingsCategory] || [];
    },
    displayedMovies() {
      const startIndex = (this.currentPage - 1) * this.moviesPerPage;
      const endIndex = startIndex + this.moviesPerPage;
      
      return this.visibleMovies.slice(startIndex, endIndex);
    },
    orderedCategories() {
      return this.categories.filter(cat => !cat.hidden);
    },
  },
  methods: {
    ...searchFunctions,
    ...paginationFunctions,
    openSettings() {
      window.open('settings.html', '_blank', 'width=1000,height=800');
    },
    closeSettings() {
      this.showSettings = false;
      this.resetNewMovie();
    },
    verifyPassword() {
      if (this.password === '5555') {
        this.showPasswordPrompt = false;
        this.showSettings = true;
        this.password = '';
      } else {
        alert('كلمة المرور غير صحيحة');
      }
    },
    resetNewMovie() {
      this.newMovie = {
        title: '',
        image: '',
        mainLink: '',
        alternativeLink: '',
        category: 'arabicNew',
        type: 'movie'
      };
    },
    toggleBulkAdd() {
      this.isBulkAdd = !this.isBulkAdd;
      this.resetInputs();
    },
    resetInputs() {
      this.newMovie = {
        title: '',
        image: '',
        mainLink: '',
        alternativeLink: '',
        category: 'arabicNew',
        type: 'movie'
      };
      this.bulkMovies = {
        titles: '',
        images: '',
        mainLinks: '',
        alternativeLinks: ''
      };
    },
    addMovie() {
      if (!this.newMovie.title || !this.newMovie.image || !this.newMovie.mainLink || !this.newMovie.category) {
        alert('يرجى ملء الحقول الإلزامية');
        return;
      }
      
      const movie = {
        id: Date.now(),
        title: this.newMovie.title,
        year: new Date().getFullYear().toString(),
        image: this.newMovie.image,
        mainLink: this.newMovie.mainLink,
        alternativeLink: this.newMovie.alternativeLink,
        category: this.newMovie.category,
        hidden: false,
        featured: false
      };
      
      this.movies.unshift(movie);
      this.saveMovies(false);  
      this.resetNewMovie();
    },
    addBulkMovies() {
      const titles = this.bulkMovies.titles.split('\n').filter(title => title.trim());
      const images = this.bulkMovies.images.split('\n').filter(image => image.trim());
      const mainLinks = this.bulkMovies.mainLinks.split('\n').filter(link => link.trim());
      const alternativeLinks = this.bulkMovies.alternativeLinks.split('\n').filter(link => link.trim());

      // Validation
      if (!titles.length || !images.length || !mainLinks.length) {
        alert('يرجى ملء الحقول الإلزامية على الأقل');
        return;
      }

      // Ensure all required arrays have the same length
      const maxLength = Math.max(titles.length, images.length, mainLinks.length);
      if (titles.length !== images.length || titles.length !== mainLinks.length) {
        alert('يجب أن يكون عدد العناوين والصور والروابط متساوياً');
        return;
      }

      // Add movies
      for (let i = 0; i < maxLength; i++) {
        const movie = {
          id: Date.now() + i,
          title: titles[i],
          year: new Date().getFullYear().toString(),
          image: images[i],
          mainLink: mainLinks[i],
          alternativeLink: alternativeLinks[i] || '',
          category: this.newMovie.category,
          hidden: false,
          featured: false
        };
        
        this.movies.unshift(movie);
      }

      this.saveMovies(false);  
      this.resetInputs();
      alert(`تمت إضافة ${maxLength} فيلم بنجاح`);
    },
    toggleMovieVisibility(movie) {
      movie.hidden = !movie.hidden;
      this.saveMovies(false);  
    },
    toggleMovieFeature(movie) {
      if (movie.category === 'rMovies' || movie.category === 'sMovies') {
        // Show dialog with two options: move to rsSelected or just toggle feature
        const userChoice = confirm('اختر أحد الخيارات:\n- اضغط "موافق" لوضع الفيلم في قسم "المختارة R + S"\n- اضغط "إلغاء" لوضع الفيلم في "الأفلام المختارة"');
        if (userChoice) {
          // Move to rsSelected category
          movie.category = 'rsSelected';
        } else {
          // Toggle feature status in featured category
          movie.featured = !movie.featured;
        }
      } else {
        movie.featured = !movie.featured;
      }
      this.saveMovies(false);
    },
    deleteMovie(movieId) {
      if (confirm('هل أنت متأكد من حذف هذا الفيلم؟')) {
        this.movies = this.movies.filter(movie => movie.id !== movieId);
        this.saveMovies(false);  
      }
    },
    watchMovie(movie) {
      if (movie.alternativeLink) {
        const choice = confirm('هل تريد مشاهدة النسخة البديلة؟');
        if (choice) {
          window.open(movie.alternativeLink, '_blank');
        } else {
          window.open(movie.mainLink, '_blank');
        }
      } else {
        window.open(movie.mainLink, '_blank');
      }
    },
    saveMovies(download = true) { 
      const movieData = JSON.stringify({
        movies_info: this.movies.map(movie => ({
          movies_name: movie.title,
          movies_img: movie.image,
          movies_href: movie.mainLink,
          movies_alt_href: movie.alternativeLink,
          movies_category: movie.category,
          movies_hidden: movie.hidden,
          movies_featured: movie.featured,
          movies_year: movie.year,
          movies_id: movie.id
        }))
      }, null, 2); 

      localStorage.setItem('movieData', movieData);

      if (download) {  
        const blob = new Blob([movieData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'movies.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    loadMovies() {
      const savedData = localStorage.getItem('movieData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          this.movies = data.movies_info.map(movie => ({
            id: movie.movies_id || Date.now(),
            title: movie.movies_name,
            image: movie.movies_img,
            mainLink: movie.movies_href,
            alternativeLink: movie.movies_alt_href || '',
            category: movie.movies_category,
            hidden: movie.movies_hidden || false,
            featured: movie.movies_featured || false,
            year: movie.movies_year || new Date().getFullYear().toString()
          }));
        } catch (e) {
          console.error('Error loading movies:', e);
        }
      }
    },
    importMoviesFromFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target.result);
            const newMovies = data.movies_info.map(movie => ({
              id: movie.movies_id || Date.now(),
              title: movie.movies_name,
              image: movie.movies_img,
              mainLink: movie.movies_href,
              alternativeLink: movie.movies_alt_href || '',
              category: movie.movies_category,
              hidden: movie.movies_hidden || false,
              featured: movie.movies_featured || false,
              year: movie.movies_year || new Date().getFullYear().toString()
            }));
            
            const existingIds = new Set(this.movies.map(m => m.id));
            const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
            this.movies = [...this.movies, ...uniqueNewMovies];
            this.saveMovies();
            alert(`تم استيراد ${uniqueNewMovies.length} فيلم بنجاح`);
          } catch (e) {
            alert('خطأ في تحليل ملف JSON: ' + e.message);
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    },
    toggleJsonParser() {
      this.showJsonParser = !this.showJsonParser;
      this.jsonInput = '';
      this.parsedData = {
        titles: '',
        images: '',
        mainLinks: ''
      };
    },
    parseJson() {
      try {
        let data;
        try {
          data = JSON.parse(this.jsonInput);
        } catch(e) {
          const cleanJson = this.jsonInput
            .replace(/[\n\r\t]/g, '')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']');
          data = JSON.parse(cleanJson);
        }

        let movies = data.movies_info || [];
        
        const titles = movies.map(m => m.movies_name || '').filter(Boolean);
        const images = movies.map(m => m.movies_img || '').filter(m => m.startsWith('https://'));
        const links = movies.map(m => m.movies_href || '').filter(m => m.startsWith('https://'));

        this.parsedData = {
          titles: titles.join('\n'),
          images: images.join('\n'),
          mainLinks: links.join('\n')
        };

        this.bulkMovies = {
          titles: this.parsedData.titles,
          images: this.parsedData.images,
          mainLinks: this.parsedData.mainLinks,
          alternativeLinks: ''
        };

        alert('تم تحليل البيانات بنجاح');
      } catch(e) {
        alert('خطأ في تحليل البيانات: ' + e.message);
      }
    },
    parseJsonFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data;
          try {
            data = JSON.parse(e.target.result);
          } catch(e) {
            const cleanJson = e.target.result
              .replace(/[\n\r\t]/g, '')
              .replace(/,\s*}/g, '}')
              .replace(/,\s*]/g, ']');
            data = JSON.parse(cleanJson);
          }

          let movies = data.movies_info || [];
          
          const titles = movies.map(m => m.movies_name || '').filter(Boolean);
          const images = movies.map(m => m.movies_img || '').filter(m => m.startsWith('https://'));
          const links = movies.map(m => m.movies_href || '').filter(m => m.startsWith('https://'));

          this.bulkMovies = {
            titles: titles.join('\n'),
            images: images.join('\n'),
            mainLinks: links.join('\n'),
            alternativeLinks: ''
          };

          alert('تم استيراد البيانات بنجاح إلى نموذج الإضافة');
        } catch(e) {
          alert('خطأ في تحليل ملف JSON: ' + e.message);
        }
      };
      reader.readAsText(file);
    },
    bulkDeleteMovies(category = null) {
      this.deleteTarget = category;
      this.showDeleteConfirm = true;
    },
    confirmBulkDelete() {
      if (this.deleteTarget === 'all') {
        this.movies = [];
      } else {
        this.movies = this.movies.filter(movie => movie.category !== this.deleteTarget);
      }
      this.saveMovies(false);  
      this.showDeleteConfirm = false;
      this.deleteTarget = null;
    },
    bulkExportCategory(category) {
      const categoryMovies = this.movies.filter(movie => movie.category === category);
      const movieData = JSON.stringify({
        movies_info: categoryMovies.map(movie => ({
          movies_name: movie.title,
          movies_img: movie.image,
          movies_href: movie.mainLink,
          movies_alt_href: movie.alternativeLink,
          movies_category: movie.category,
          movies_hidden: movie.hidden,
          movies_featured: movie.featured,
          movies_year: movie.year,
          movies_id: movie.id
        }))
      }, null, 2);

      const blob = new Blob([movieData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movies-${category}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    moveMovie(movie) {
      if (!movie.targetCategory) {
        alert('الرجاء اختيار القسم المراد نقل الفيلم إليه');
        return;
      }
      
      const targetCategory = this.categories.find(c => c.id === movie.targetCategory);
      if (confirm(`هل أنت متأكد من نقل الفيلم "${movie.title}" إلى قسم "${targetCategory.name}"؟`)) {
        movie.category = movie.targetCategory;
        delete movie.targetCategory; // Remove the temporary property
        this.saveMovies(false);
      }
    },
    toggleCategoryVisibility(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      if (category) {
        category.hidden = !category.hidden;
        this.saveCategorySettings();
      }
    },
    
    saveCategorySettings() {
      localStorage.setItem('categorySettings', JSON.stringify(
        this.categories.map(cat => ({
          id: cat.id,
          hidden: cat.hidden || false
        }))
      ));
    },
    
    loadCategorySettings() {
      const savedSettings = localStorage.getItem('categorySettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          settings.forEach(setting => {
            const category = this.categories.find(cat => cat.id === setting.id);
            if (category) {
              category.hidden = setting.hidden;
            }
          });
        } catch (e) {
          console.error('Error loading category settings:', e);
        }
      }
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.currentPage = 1; // Reset to first page
    },
    getCategoryDomainOrder(categoryId) {
      const domainOrders = JSON.parse(localStorage.getItem('categoryDomainOrder') || '{}');
      return domainOrders[categoryId] || [];
    },
    
    orderMoviesByDomain(movies, domainOrder) {
      return [...movies].sort((a, b) => {
        const domainA = this.getDomainFromUrl(a.mainLink);
        const domainB = this.getDomainFromUrl(b.mainLink);
        
        const indexA = domainOrder.indexOf(domainA);
        const indexB = domainOrder.indexOf(domainB);
        
        // If both domains are in the order list
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one domain is in the order list
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // If neither domain is in the order list
        return 0;
      });
    },
    
    getDomainFromUrl(url) {
      try {
        return new URL(url).hostname;
      } catch (e) {
        return '';
      }
    },
  },
  created() {
    this.loadMovies();
    this.loadCategorySettings();
    
    this.$watch('selectedCategory', () => {
      this.currentPage = 1;
    });
    
    // Check if running in WebView
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isOldAndroid = isAndroid && /android 2|android 3|android 4\.0|android 4\.1|android 4\.2|android 4\.3/.test(userAgent);
    
    if (isOldAndroid) {
      // Adjust for older Android browsers
      document.documentElement.classList.add('legacy-android');
      console.log('Running on older Android WebView, applying compatibility mode');
    }
  }
});