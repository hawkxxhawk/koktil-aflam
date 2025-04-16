new Vue({
  el: '#settingsApp',
  data: {
    isAuthenticated: false,
    password: '',
    showPasswordPrompt: true,
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
    movies: [],
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
    deleteTarget: null,
    managementMode: 'category',
    selectedDomain: '',
    hiddenDomains: [],
    selectedSortSite: '',
    categoryDomainOrder: {},
  },
  computed: {
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
      let movies = this.moviesByCategory[this.settingsCategory] || [];
      
      // Sort by domain order if available
      if (this.categoryDomainOrder[this.settingsCategory]) {
        const domainOrder = this.categoryDomainOrder[this.settingsCategory];
        
        // Sort movies based on domain order
        movies = [...movies].sort((a, b) => {
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
      }
      
      return movies;
    },
    domains() {
      const domainsSet = new Set();
      this.movies.forEach(movie => {
        if (movie.mainLink) {
          try {
            const url = new URL(movie.mainLink);
            domainsSet.add(url.hostname);
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      });
      return Array.from(domainsSet).sort();
    },
  },
  methods: {
    closeWindow() {
      if (this.isAuthenticated) {
        if (confirm('هل تريد العودة للرئيسية؟')) {
          window.close();
        }
      } else {
        window.close();
      }
    },
    verifyPassword() {
      if (this.password === '5555') {
        this.showPasswordPrompt = false;
        this.isAuthenticated = true;
        this.loadMovies();
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

      if (!titles.length || !images.length || !mainLinks.length) {
        alert('يرجى ملء الحقول الإلزامية على الأقل');
        return;
      }

      const maxLength = Math.max(titles.length, images.length, mainLinks.length);
      if (titles.length !== images.length || titles.length !== mainLinks.length) {
        alert('يجب أن يكون عدد العناوين والصور والروابط متساوياً');
        return;
      }

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
        const choice = confirm('اختر أحد الخيارات:\n- اضغط "موافق" لوضع الفيلم في قسم "المختارة R + S"\n- اضغط "إلغاء" لوضع الفيلم في "الأفلام المختارة"');
        if (choice) {
          // Move to rsSelected category without marking as featured
          movie.category = 'rsSelected';
        } else {
          // Toggle feature status in current category
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
          
          this.loadCategorySettings();
          this.loadDomainSettings();
          this.loadDomainOrders();
          
          // Set initial selected domain if available
          if (this.domains.length > 0) {
            this.selectedDomain = this.domains[0];
          }
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
            this.saveMovies(false);
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
        
        // Refresh the view
        this.$nextTick(() => {
          // Force a refresh of the computed property
          this.settingsCategory = this.settingsCategory;
        });
      }
    },
    getDomainFromUrl(url) {
      try {
        return new URL(url).hostname;
      } catch (e) {
        return '';
      }
    },
    
    getDomainsByCategory(categoryId) {
      const movies = this.moviesByCategory[categoryId] || [];
      const domainsSet = new Set();
      
      movies.forEach(movie => {
        if (movie.mainLink) {
          try {
            const url = new URL(movie.mainLink);
            domainsSet.add(url.hostname);
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      });
      
      return Array.from(domainsSet).sort();
    },
    
    isDomainHidden(domain) {
      return this.hiddenDomains.includes(domain);
    },
    
    toggleDomainVisibility(domain) {
      const movies = this.getMoviesByDomain(domain);
      const isCurrentlyHidden = this.isDomainHidden(domain);
      
      // Update hiddenDomains array
      if (isCurrentlyHidden) {
        this.hiddenDomains = this.hiddenDomains.filter(d => d !== domain);
      } else {
        this.hiddenDomains.push(domain);
      }
      
      // Update all movies from this domain
      movies.forEach(movie => {
        movie.hidden = !isCurrentlyHidden;
      });
      
      this.saveMovies(false);
      this.saveDomainSettings();
    },
    
    bulkDeleteDomain(domain) {
      if (confirm(`هل أنت متأكد من حذف جميع الأفلام من موقع "${domain}"؟`)) {
        const movieIds = this.getMoviesByDomain(domain).map(movie => movie.id);
        this.movies = this.movies.filter(movie => !movieIds.includes(movie.id));
        this.saveMovies(false);
      }
    },
    
    bulkExportDomain(domain) {
      const domainMovies = this.getMoviesByDomain(domain);
      const movieData = JSON.stringify({
        movies_info: domainMovies.map(movie => ({
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
      a.download = `movies-${domain}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    saveDomainSettings() {
      localStorage.setItem('hiddenDomains', JSON.stringify(this.hiddenDomains));
    },
    
    loadDomainSettings() {
      const savedSettings = localStorage.getItem('hiddenDomains');
      if (savedSettings) {
        try {
          this.hiddenDomains = JSON.parse(savedSettings);
        } catch (e) {
          console.error('Error loading domain settings:', e);
        }
      }
    },
    getMoviesByDomain(domain) {
      return this.movies.filter(movie => {
        try {
          const movieDomain = new URL(movie.mainLink).hostname;
          return movieDomain === domain;
        } catch (e) {
          return false;
        }
      });
    },
    
    sortCategoryByDomain() {
      if (!this.selectedSortSite || !this.settingsCategory) return;
      
      // Initialize domain order for this category if it doesn't exist
      if (!this.categoryDomainOrder[this.settingsCategory]) {
        this.categoryDomainOrder[this.settingsCategory] = [];
      }
      
      // Add the selected domain to the order if it's not already there
      if (!this.categoryDomainOrder[this.settingsCategory].includes(this.selectedSortSite)) {
        this.categoryDomainOrder[this.settingsCategory].push(this.selectedSortSite);
      }
      
      // Save the order to localStorage
      this.saveDomainOrders();
    },
    
    moveSiteToTop(domain, categoryId) {
      if (!this.categoryDomainOrder[categoryId]) return;
      
      const index = this.categoryDomainOrder[categoryId].indexOf(domain);
      if (index > 0) {
        // Remove the domain from its current position
        this.categoryDomainOrder[categoryId].splice(index, 1);
        // Add it to the beginning of the array
        this.categoryDomainOrder[categoryId].unshift(domain);
        
        this.saveDomainOrders();
      }
    },
    
    moveSiteToBottom(domain, categoryId) {
      if (!this.categoryDomainOrder[categoryId]) return;
      
      const index = this.categoryDomainOrder[categoryId].indexOf(domain);
      if (index !== -1 && index < this.categoryDomainOrder[categoryId].length - 1) {
        // Remove the domain from its current position
        this.categoryDomainOrder[categoryId].splice(index, 1);
        // Add it to the end of the array
        this.categoryDomainOrder[categoryId].push(domain);
        
        this.saveDomainOrders();
      }
    },
    
    saveDomainOrders() {
      localStorage.setItem('categoryDomainOrder', JSON.stringify(this.categoryDomainOrder));
    },
    
    loadDomainOrders() {
      const savedOrders = localStorage.getItem('categoryDomainOrder');
      if (savedOrders) {
        try {
          this.categoryDomainOrder = JSON.parse(savedOrders);
        } catch (e) {
          console.error('Error loading domain orders:', e);
          this.categoryDomainOrder = {};
        }
      }
    },
  }
});