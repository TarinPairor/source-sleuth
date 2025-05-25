 // URL configuration - you can modify this or load from a JSON file
const URL_CONFIG = [
    {
      "link": "https://en.wikipedia.org/wiki/Donald_Trump",
      "color": "#28a745",
      "tag": "reliable"
    },
    {
      "link": "https://apnews.com/hub/donald-trump",
      "color": "#007bff",
      "tag": "news"
    },
    {
      "link": "https://www.cnn.com/politics/donald-trump",
      "color": "#ffc107",
      "tag": "breaking"
    },
    {
      "link": "https://www.foxnews.com/category/person/donald-trump",
      "color": "#dc3545",
      "tag": "biased"
    },
    {
      "link": "https://www.reuters.com/topic/person/donald-trump",
      "color": "#17a2b8",
      "tag": "factual"
    },
    {
      "link": "https://www.bbc.com/news/topics/cx1m7zg0gylt/donald-trump",
      "color": "#6610f2",
      "tag": "international"
    },
    {
      "link": "https://truthsocial.com/@realDonaldTrump",
      "color": "#fd7e14",
      "tag": "personal"
    },
    {
      "link": "https://ballotpedia.org/Donald_Trump",
      "color": "#20c997",
      "tag": "reference"
    },
    {
      "link": "https://www.whitehouse.gov/people/donald-j-trump",
      "color": "#6f42c1",
      "tag": "official"
    },
    {
      "link": "https://www.snopes.com/tag/donald-trump",
      "color": "#e83e8c",
      "tag": "fact-check"
    },
    {
        "link": "https://books.google.com/books?hl=en&lr=&id=Ye6e_VxM00kC&oi=fnd&pg=PA1&dq=trump&ots=6-uXlwMNFm&sig=tInbsZYKIwKAYtJRb_jamiB3OoE",
        "color": "#343a40",
        "tag": "academic"
    }
  ];
  
  // Wait for the page to load and search results to appear
  function markConfiguredSearchResults() {
    // Common selectors for Google search results
    const searchResultSelectors = [
      'div[data-ved] h3 a', // Main organic results
      '[data-ved] a[href*="/url?"]', // URL-wrapped results
      '.yuRUbf a', // Another common selector
      '.g h3 a', // Alternative selector
      '.gs_rt a' // Google Scholar result titles
    ];
    
    let allResults = [];
    
    // Collect all search result links
    for (const selector of searchResultSelectors) {
      const results = document.querySelectorAll(selector);
      allResults.push(...Array.from(results));
    }
    
    // Remove duplicates
    allResults = [...new Set(allResults)];
    
    // Check each result against our configuration
    allResults.forEach((resultElement, index) => {
      const resultUrl = extractActualUrl(resultElement.href);
      const matchedConfig = findMatchingConfig(resultUrl);
      
      if (matchedConfig) {
        // Create modal for this result
        setTimeout(() => {
          createModal(resultElement, matchedConfig, index);
          highlightResult(resultElement, matchedConfig);
        }, index * 200); // Stagger the modals slightly
      }
    });
  }
  
  // Extract the actual URL from Google's wrapped URL
  function extractActualUrl(googleUrl) {
    try {
      if (googleUrl.includes('/url?')) {
        const urlParams = new URLSearchParams(googleUrl.split('/url?')[1]);
        return urlParams.get('q') || googleUrl;
      }
      return googleUrl;
    } catch (e) {
      return googleUrl;
    }
  }
  
  // Find matching configuration for a URL
  function findMatchingConfig(url) {
    return URL_CONFIG.find(config => {
      try {
        const configDomain = new URL(config.link).hostname.replace('www.', '');
        const resultDomain = new URL(url).hostname.replace('www.', '');
        
        // Check if domains match or if the URL contains the config link
        return configDomain === resultDomain || 
               url.includes(configDomain) || 
               url.toLowerCase().includes(config.link.toLowerCase());
      } catch (e) {
        // Fallback to simple string matching
        return url.toLowerCase().includes(config.link.toLowerCase()) ||
               config.link.toLowerCase().includes(url.toLowerCase());
      }
    });
  }
  
  function createModal(resultElement, config, index) {
    // Remove existing modal for this specific result if present
    const existingModal = document.getElementById(`result-modal-${index}`);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Get the position of the result element
    const rect = resultElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.id = `result-modal-${index}`;
    modal.className = 'result-modal-tooltip';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'result-modal-content';
    modalContent.style.backgroundColor = config.color;
    
    const modalText = document.createElement('span');
    modalText.textContent = `🏷️ ${config.tag.toUpperCase()}`;
    modalText.className = 'result-modal-text';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'result-modal-close';
    closeButton.setAttribute('aria-label', 'Close');
    
    // Assemble modal
    modalContent.appendChild(modalText);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Position the modal absolutely on the page, above the result
    modal.style.position = 'absolute';
    modal.style.top = (rect.top + scrollTop - 40) + 'px';
    modal.style.left = (rect.left + scrollLeft) + 'px';
    modal.style.zIndex = '10000';
    
    // Append to body instead of the search result container
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeModal = () => {
      if (modal && modal.parentNode) {
        modal.remove();
      }
    };
    
    closeButton.addEventListener('click', closeModal);
    
    // Auto-hide after 5 seconds (longer since there might be multiple)
    // setTimeout(closeModal, 10000);
  }
  
  function highlightResult(element, config) {
    // Remove existing highlights from this element
    const resultContainer = element.closest('.g') || element.closest('[data-ved]') || element.closest('.yuRUbf') || element.closest('.gs_r');
    
    if (resultContainer) {
      resultContainer.classList.add('configured-result-highlight');
      resultContainer.style.borderColor = config.color;
      resultContainer.setAttribute('data-tag', config.tag);
    }
  }
  
  // Function to detect when a new search is performed
  function observeSearchChanges() {
    // Create a MutationObserver to watch for changes in the search results
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if search results were added
          const hasSearchResults = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.querySelector('.g') || node.querySelector('[data-ved]'))
          );
          
          if (hasSearchResults) {
            setTimeout(markConfiguredSearchResults, 500); // Small delay to ensure content is loaded
          }
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(markConfiguredSearchResults, 1000);
      observeSearchChanges();
    });
  } else {
    setTimeout(markConfiguredSearchResults, 1000);
    observeSearchChanges();
  }
  
  // Also trigger on URL changes (for single-page app navigation)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      if (currentUrl.includes('/search')) {
        setTimeout(markConfiguredSearchResults, 1000);
      }
    }
  }, 1000);