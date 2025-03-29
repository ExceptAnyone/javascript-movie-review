(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const $ = (selector, scope = document) => {
  if (!selector) throw new Error("Selector is not selected");
  return scope.querySelector(selector);
};
const $$ = (selector, scope = document) => {
  if (!selector) throw new Error("Selector is not selected");
  return scope.querySelectorAll(selector);
};
const parseAttribute = (attribute) => {
  return Object.entries(attribute).map(([key, value]) => `${key}="${value}"`).join("");
};
const isTarget = (target, {
  targetSelector,
  parentSelector
}) => {
  const children = $$(targetSelector, $(parentSelector));
  if (target instanceof Element && children)
    return [...children].includes(target) || target.closest(targetSelector);
  return false;
};
const ErrorMessage = (props) => {
  const { children, attribute } = props;
  return `<div ${parseAttribute(attribute)}>${children}</div>`;
};
const images = {
  logo: "./logo.png",
  starEmpty: "./star_empty.png",
  starFilled: "./star_filled.png",
  woowacourse: "./woowacourse_logo.png",
  search: "./search.png"
};
const Footer = () => {
  return `
    <footer class="footer">
        <p>&copy; 우아한테크코스 All Rights Reserved.</p>
        <p><img src="${images.woowacourse}" width="180" alt="우아한테크코스"/></p>
    </footer>
  `;
};
const debounce = (callback) => {
  let id = -1;
  return () => {
    cancelAnimationFrame(id);
    id = requestAnimationFrame(callback);
  };
};
const timeOutDebounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
};
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (typeof obj1 !== typeof obj2) return false;
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return obj1.length === obj2.length && obj1.every((item, index) => deepEqual(item, obj2[index]));
    }
    return keys1.every(
      (key) => deepEqual(
        obj1[key],
        obj2[key]
      )
    );
  }
  return false;
};
function Core() {
  const options2 = {
    currentStateKey: 0,
    states: [],
    events: [],
    root: null,
    rootComponent: null
  };
  function useState2(initialState) {
    const { currentStateKey: key, states } = options2;
    if (states.length === key) states.push(initialState);
    const state = states[key];
    const setState = (newState) => {
      if (deepEqual(newState, state)) return;
      states[key] = newState;
      _render();
    };
    options2.currentStateKey += 1;
    return [state, setState];
  }
  const _render = debounce(() => {
    const { root, rootComponent } = options2;
    if (!root || !rootComponent) return;
    root.innerHTML = rootComponent();
    options2.currentStateKey = 0;
    _addEvent();
    options2.events = [];
  });
  function render2(rootComponent, root) {
    options2.root = root;
    options2.rootComponent = rootComponent;
    _render();
  }
  function useEvents2(parentSelector) {
    function addEvent(event, targetSelector, callback) {
      const { events } = options2;
      events.push({ event, targetSelector, parentSelector, callback });
    }
    return [addEvent];
  }
  function _addEvent() {
    options2.events.forEach(
      ({ parentSelector, targetSelector, event, callback }) => {
        var _a;
        (_a = $(parentSelector)) == null ? void 0 : _a.addEventListener(event, (e) => {
          const $parent = $(parentSelector);
          if (isTarget(e.target, { targetSelector, parentSelector }) && $parent)
            callback(e);
        });
      }
    );
  }
  function reRender2() {
    _render();
  }
  return { useState: useState2, useEvents: useEvents2, render: render2, reRender: reRender2 };
}
const { useState, useEvents, render, reRender } = Core();
let currentPage = 1;
let movies = [];
let searchInputValue = "";
let searchResults = [];
let totalResults = 0;
let isLoading = true;
let isMoreError = false;
let isError = false;
let isSearchError = false;
let movieDetail = null;
let isOpenModal = false;
const setMovies = (newMovies) => {
  movies = newMovies;
  reRender();
};
const setSearchInputValue = (value) => {
  searchInputValue = value;
  reRender();
};
const setSearchResults = (results) => {
  searchResults = results;
  reRender();
};
const setTotalResults = (total) => {
  totalResults = total;
  reRender();
};
const appendMovies = (newMovies) => {
  movies = [...movies, ...newMovies];
  currentPage += 1;
  reRender();
};
const appendSearchResults = (newResults) => {
  searchResults = [...searchResults, ...newResults];
  currentPage += 1;
  reRender();
};
const resetPage = () => {
  currentPage = 1;
};
const setIsError = (value) => {
  isError = value;
  reRender();
};
const setIsMoreError = (value) => {
  isMoreError = value;
  reRender();
};
const setIsSearchError = (value) => {
  isSearchError = value;
  reRender();
};
const setSelectedMovieId = (movieId) => {
  reRender();
};
const setMovieDetail = (detail) => {
  movieDetail = detail;
  reRender();
};
const setIsOpenModal = (value) => {
  isOpenModal = value;
  reRender();
};
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYTI4NGQyMzkyYWI1Y2Q3NTRhMDJiYWEzYzM3NmZlNiIsIm5iZiI6MTY5MDk4NDkyMS43NTIsInN1YiI6IjY0Y2E2MWQ5MGNiMzM1MTdjMDZhOWQ1MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.piQJfh75UeyzIY-z6BLJz3SU6m9AlKsM_tU7wtRt04c"}`
  }
};
const url = {
  popular: (page) => `${"https://api.themoviedb.org/3"}/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc=${page}`,
  search: (query) => `${"https://api.themoviedb.org/3"}/search/movie?include_adult=false&language=ko-KR&page=1&query=${encodeURIComponent(
    query
  )}`,
  more: (page) => `${"https://api.themoviedb.org/3"}/search/movie?include_adult=false&language=ko-KR&page=${page}&query=${encodeURIComponent(
    searchInputValue
  )}`,
  detail: (movie_id) => `${"https://api.themoviedb.org/3"}/movie/${movie_id}`
};
const useGetSearchMovieList = () => {
  const fetchSearchMovieList = async (query) => {
    const searchUrl = url.search(query);
    try {
      const response = await fetch(searchUrl, options);
      const data = await response.json();
      const results = data.results || [];
      setTotalResults(data.total_results);
      setSearchResults(results);
      resetPage();
      return results;
    } catch (error) {
      setIsSearchError(true);
      console.error("Error fetching data:", error);
    }
    return null;
  };
  return { fetchSearchMovieList };
};
const useInputChange = (selector, setSearchInputValue2) => {
  const handleInputChange = () => {
    const inputElement = $(selector);
    const inputValue = inputElement.value;
    if (!inputValue.trim()) return;
    setSearchInputValue2(inputValue);
  };
  const resetInput = () => {
    const inputValue = $(selector);
    if (inputValue) {
      inputValue.value = "";
    }
  };
  return { handleInputChange, resetInput };
};
const Button = (props) => {
  const { attribute, children } = props;
  return `
    <button ${parseAttribute(attribute)}" >${children}</button>`;
};
const Input = (props) => {
  const { attribute } = props;
  return `
  <input ${parseAttribute(attribute)} />
 `;
};
const Header = (props) => {
  const { rate, title, src } = props;
  const { fetchSearchMovieList } = useGetSearchMovieList();
  const { handleInputChange, resetInput } = useInputChange(
    ".search-input",
    setSearchInputValue
  );
  const [addEvent] = useEvents(".background-container");
  addEvent("click", ".search-button-icon", async (e) => {
    e.preventDefault();
    handleInputChange();
    if (searchInputValue) {
      await fetchSearchMovieList(searchInputValue);
      resetInput();
    }
  });
  addEvent("click", ".logo", () => {
    window.location.href = "/";
  });
  return `
    <header class="header">
        <div class="background-container">
          <div class="overlay" aria-hidden="true">
            <img src="https://image.tmdb.org/t/p/w500${src}" alt="background" />
          </div>
          <div class="top-rated-container">
           <div class="input-container">
            <form>
            ${Input({
    attribute: {
      class: "search-input",
      type: "text",
      placeholder: "검색어를 입력하세요",
      value: searchInputValue
    }
  })}
              
              ${Button({
    attribute: {
      class: "search-button-icon"
    },
    children: `<img src="${images.search}" alt="search" />`
  })}
             </form>
            </div>
            <h1 class="logo">
              <img src="${images.logo}" alt="MovieList" />
            </h1>
            <div class="top-rated-movie">
              <div class="rate">
                <img src="${images.starEmpty}" class="star" />
                <span class="rate-value">${rate}</span>
              </div>
              <div class="title">${title}</div>
              ${Button({
    attribute: {
      class: "primary detail"
    },
    children: "자세히 보기"
  })}
            </div>
          </div>
        </div>
      </header>
  `;
};
const MOVIE_RATINGS_KEY = "movie_ratings";
const getMovieRatings = () => {
  const ratings = localStorage.getItem(MOVIE_RATINGS_KEY);
  return ratings ? JSON.parse(ratings) : [];
};
const getMovieRating = (movieId) => {
  const ratings = getMovieRatings();
  const movieRating = ratings.find((rating) => rating.movieId === movieId);
  return movieRating ? movieRating.rating : null;
};
const saveMovieRating = (movieId, rating) => {
  const ratings = getMovieRatings();
  const existingRatingIndex = ratings.findIndex((r) => r.movieId === movieId);
  if (existingRatingIndex !== -1) {
    ratings[existingRatingIndex].rating = rating;
  } else {
    ratings.push({ movieId, rating });
  }
  localStorage.setItem(MOVIE_RATINGS_KEY, JSON.stringify(ratings));
};
const useStarRating = (movieId, container) => {
  const updateStarDisplay = (stars, ratingText, rating) => {
    stars.forEach((star, index) => {
      const starValue = (index + 1) * 2;
      if (starValue <= rating) {
        star.setAttribute("src", images.starFilled);
      } else {
        star.setAttribute("src", images.starEmpty);
      }
    });
    const ratingTexts2 = {
      2: "최악이에요",
      4: "별로에요",
      6: "보통이에요",
      8: "재미있어요",
      10: "명작이에요"
    };
    if (ratingText && rating in ratingTexts2) {
      ratingText.textContent = ratingTexts2[rating];
      ratingText.classList.add("visible");
    } else if (ratingText) {
      ratingText.classList.remove("visible");
    }
  };
  const getElements = () => {
    const stars = container.querySelectorAll(".star");
    const ratingText = container.querySelector(".rating-text");
    return { stars, ratingText };
  };
  const updateRating = (rating) => {
    const { stars, ratingText } = getElements();
    updateStarDisplay(stars, ratingText, rating);
  };
  const handleStarClick = (index) => {
    const newRating = (index + 1) * 2;
    saveMovieRating(movieId, newRating);
    updateRating(newRating);
  };
  const handleStarHover = (index) => {
    const hoverRating = (index + 1) * 2;
    updateRating(hoverRating);
  };
  const handleStarLeave = () => {
    const savedRating = getMovieRating(movieId) || 0;
    updateRating(savedRating);
  };
  return {
    updateRating,
    handleStarClick,
    handleStarHover,
    handleStarLeave
  };
};
const ratingTexts = {
  2: "최악이에요",
  4: "별로에요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const getStarSrc = (currentRating, starValue) => {
  return currentRating >= starValue ? images.starFilled : images.starEmpty;
};
const Stars = (props) => {
  const { attribute } = props;
  return `
    <img ${parseAttribute(attribute)} />
  `;
};
const StarRating = (props) => {
  const { movieId, containerClass = "rating-container" } = props;
  const currentRating = getMovieRating(movieId) || 0;
  setTimeout(() => {
    const container = $(`.${containerClass}`);
    if (!container) return;
    const { updateRating, handleStarClick, handleStarHover, handleStarLeave } = useStarRating(movieId, container);
    updateRating(currentRating);
    const stars = $$(".star", container);
    stars.forEach((star, index) => {
      star.addEventListener("click", () => handleStarClick(index));
      star.addEventListener("mouseover", () => handleStarHover(index));
      star.addEventListener("mouseout", handleStarLeave);
    });
  }, 0);
  return `
    <div class="${containerClass}">
      <div class="stars">
        ${Object.entries(ratingTexts).map(
    ([key, _]) => Stars({
      attribute: {
        src: getStarSrc(currentRating, parseInt(key)),
        class: "star",
        "data-value": key,
        alt: `${key}점`
      }
    })
  ).join("")}
      </div>
      <span class="rating-text ${currentRating ? "visible" : ""}">
        ${currentRating in ratingTexts ? ratingTexts[currentRating] : ""}
      </span>
    </div>
  `;
};
const Modal = (props) => {
  const { children } = props;
  const [addEvent] = useEvents("body");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modalBg = $(".modal-background");
      if (modalBg) {
        modalBg.classList.remove("active");
        document.body.classList.remove("modal-open");
        setIsOpenModal(false);
      }
    }
  });
  addEvent("click", ".modal-background", (e) => {
    if (e.target.classList.contains("modal-background")) {
      const modalBg = $(".modal-background");
      if (modalBg) {
        modalBg.classList.remove("active");
        document.body.classList.remove("modal-open");
        setIsOpenModal(false);
      }
    }
  });
  addEvent("click", "#closeModal", () => {
    const modalBg = $(".modal-background");
    if (modalBg) {
      modalBg.classList.remove("active");
      document.body.classList.remove("modal-open");
      setIsOpenModal(false);
    }
  });
  if (isOpenModal) {
    setTimeout(() => {
      const modalBg = $(".modal-background");
      if (modalBg) {
        modalBg.classList.add("active");
        document.body.classList.add("modal-open");
      }
    }, 0);
  }
  return `
    <div class="modal-background">
      <div class="modal">
        ${children}
      </div>
    </div>
  `;
};
const MovieDetailModal = (props) => {
  const { title, rate, src, description, genres, releaseDate, id } = props;
  return `
  ${Modal({
    children: `
        <button class="close-modal" id="closeModal">
          <img src="./modal_button_close.png" />
        </button>
        <div class="modal-container">
          <div class="modal-image">
            <img
              src="${src}"
            />
          </div>
          <div class="modal-description">
            <h2>${title}</h2>
            <p class="category">
              ${releaseDate} · ${genres}
            </p>
            <p class="rate">
              <img src="${images.starFilled}" class="star-filled" /><span
                >${rate}</span>
            </p>
            <hr />
            <div class="user-rating">
              <h3>내 별점</h3>
              ${StarRating({
      movieId: id,
      containerClass: `rating-container-${id}`
    })}
            </div>
            <hr />
            <p class="detail">
              ${description}
            </p>
          </div>
        </div>
    `
  })}
  `;
};
const MovieItem = (props) => {
  const { title, rate, src, id } = props;
  return `
              <li class="item-container" data-id="${id}">
                <div class="item">
                  <img
                    class="thumbnail"
                    src="${src}"
                    alt="${title}"
                  />
                  <div class="item-desc">
                    <p class="rate">
                      <img src="${images.starEmpty}" class="star" />
                      <span>${rate}</span>
                    </p>
                    <strong>${title}</strong>
                  </div>
                </div>
              </li>
  `;
};
const Skeleton = () => {
  return `
    <li>
      <div class="skeleton-item skeleton">
      <div class="skeleton-thumbnail"></div>
      <div class="skeleton-item-desc">
        <p class="skeleton-rate">
          <div class="skeleton-star"></div>
          <div class="skeleton-text"></div>
        </p>
        <div class="skeleton-title"></div>
      </div>
    </div>
  </li>
  `;
};
const SkeletonList = () => {
  return `
    <ul class="thumbnail-list">
      ${Array(20).fill(null).map(() => Skeleton()).join("")}
    </ul>
  `;
};
const renderIf = (condition, trueValue, falseValue) => {
  return condition ? trueValue : falseValue === void 0 ? "" : falseValue;
};
const renderIfString = (condition, trueValue, falseValue = "") => {
  return condition ? trueValue : falseValue;
};
const renderSwitch = (conditions, defaultValue) => {
  for (const [condition, value] of conditions) {
    if (condition) return value;
  }
  return defaultValue === void 0 ? "" : defaultValue;
};
const MovieList = (props) => {
  const { movies: movies2, isSearchMode, searchQuery } = props;
  return renderSwitch([
    [
      isSearchMode && movies2.length === 0 && searchQuery.trim().length > 0,
      `<div class="no-results">검색 결과가 없습니다.</div>`
    ],
    [movies2.length === 0, SkeletonList()],
    [
      true,
      `<ul class="thumbnail-list">
        ${movies2.map(
        (movie) => MovieItem({
          title: movie.title,
          rate: movie.vote_count,
          src: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          id: movie.id.toString()
        })
      ).join("")}
      </ul>`
    ]
  ]);
};
const SearchResultMessage = (props) => {
  const { isError: isError2, children, attribute } = props;
  return renderIfString(
    isError2,
    `<div ${parseAttribute(attribute)}>${children}</div>`
  );
};
const useGetMovieDetail = () => {
  const fetchMovieDetail = async (movieId) => {
    try {
      const response = await fetch(url.detail(movieId), options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("영화 디테일을 불러오는데 실패", error);
      return null;
    }
  };
  return { fetchMovieDetail };
};
const useMovieDetail = () => {
  const { fetchMovieDetail } = useGetMovieDetail();
  const handleMovieItemClick = async (movieId) => {
    if (!movieId) return;
    setSelectedMovieId();
    if (isOpenModal) {
      setIsOpenModal(false);
      const modalBg = $(".modal-background");
      if (!modalBg) return;
      modalBg.classList.remove("active");
      setTimeout(async () => {
        await fetchAndDisplayMovieDetail(movieId);
      }, 300);
      return;
    }
    await fetchAndDisplayMovieDetail(movieId);
  };
  const fetchAndDisplayMovieDetail = async (movieId) => {
    const detail = await fetchMovieDetail(movieId);
    if (!detail) return;
    setMovieDetail(detail);
    setIsOpenModal(true);
  };
  return {
    handleMovieItemClick,
    fetchAndDisplayMovieDetail
  };
};
const useGetMovieList = () => {
  const fetchMovies = async (page) => {
    const [isLoading2, setIsLoading] = useState(false);
    try {
      const response = await fetch(url.popular(page), options);
      const data = await response.json();
      if (data) {
        setIsLoading(false);
      }
      setMovies([...movies, ...data.results]);
      setTotalResults(data.total_results);
      return { isLoading: isLoading2, data: data.results };
    } catch (error) {
      setIsError(true);
      console.error("Error fetching data in App:", error);
    }
    return { isLoading: isLoading2, data: null };
  };
  return { fetchMovies, isLoading };
};
const useGetMoreMovieList = () => {
  const fetchMoreMovies = async (callback) => {
    const nextPage = currentPage + 1;
    if (searchInputValue.trim()) {
      try {
        const response = await fetch(url.more(nextPage), options);
        const data = await response.json();
        appendSearchResults(data.results);
        return data.results;
      } catch (error) {
        console.error("Error fetching search results:", error);
        setIsMoreError(true);
      }
      return { isLoading: false, data: null };
    } else {
      const newMovies = await callback(nextPage);
      if (newMovies) {
        appendMovies(newMovies.data ?? []);
      }
      return newMovies;
    }
  };
  return { fetchMoreMovies, isMoreError };
};
const scrollHandler = {
  callback: null,
  handleScroll: null
};
const useInfiniteScroll = (callback, threshold = 500) => {
  if (scrollHandler.handleScroll) {
    window.removeEventListener("scroll", scrollHandler.handleScroll);
    scrollHandler.handleScroll = null;
    scrollHandler.callback = null;
  }
  scrollHandler.callback = callback;
  scrollHandler.handleScroll = timeOutDebounce(() => {
    const isBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - threshold;
    if (isBottom && scrollHandler.callback) {
      scrollHandler.callback();
    }
  }, 500);
  window.addEventListener("scroll", scrollHandler.handleScroll);
};
const useMovieList = () => {
  const { fetchMovies, isLoading: isLoading2 } = useGetMovieList();
  const { fetchMoreMovies, isMoreError: isMoreError2 } = useGetMoreMovieList();
  const setupInfiniteScroll = () => {
    if (movies.length < totalResults) {
      useInfiniteScroll(() => {
        fetchMoreMovies(fetchMovies);
      });
    }
  };
  const loadInitialMovies = () => {
    if (movies.length === 0) {
      fetchMovies(1).then((results) => {
        if (results) {
          setMovies(results.data ?? []);
        }
      });
    }
  };
  return {
    isLoading: isLoading2,
    isMoreError: isMoreError2,
    setupInfiniteScroll,
    loadInitialMovies
  };
};
const App = () => {
  var _a, _b, _c;
  const { handleMovieItemClick } = useMovieDetail();
  const { isMoreError: isMoreError2, setupInfiniteScroll, loadInitialMovies } = useMovieList();
  const [addEvent] = useEvents(".thumbnail-list");
  addEvent("click", ".item-container", async (e) => {
    const itemContainer = e.target.closest(
      ".item-container"
    );
    if (!itemContainer) return;
    const movieId = itemContainer.dataset.id;
    if (!movieId) return;
    await handleMovieItemClick(movieId);
  });
  setupInfiniteScroll();
  loadInitialMovies();
  const displayMovieList = searchResults.length > 0 ? searchResults : movies;
  const isSearchMode = searchResults.length > 0;
  const headerContent = renderIf(
    isError || !movies.length,
    ErrorMessage({
      children: "에러가 발생했습니다. 다시 시도해주세요.",
      attribute: {
        class: "movie-list-error"
      }
    }),
    Header({
      rate: ((_a = movies[0]) == null ? void 0 : _a.vote_count) ?? 0,
      title: ((_b = movies[0]) == null ? void 0 : _b.title) ?? "",
      src: ((_c = movies[0]) == null ? void 0 : _c.backdrop_path) ?? ""
    })
  );
  const subTitle = renderIfString(
    isSearchMode,
    "검색 결과",
    "지금 인기 있는 영화"
  );
  const moreErrorMessage = renderIfString(
    isMoreError2,
    ErrorMessage({
      children: "영화 목록을 불러오는 데 실패했습니다.",
      attribute: {
        class: "error-message"
      }
    })
  );
  const modalContent = renderIfString(
    isOpenModal && !!movieDetail,
    MovieDetailModal({
      title: (movieDetail == null ? void 0 : movieDetail.title) ?? "",
      rate: (movieDetail == null ? void 0 : movieDetail.vote_average) ?? 0,
      src: `https://image.tmdb.org/t/p/w500${movieDetail == null ? void 0 : movieDetail.poster_path}`,
      description: (movieDetail == null ? void 0 : movieDetail.overview) ?? "",
      genres: (movieDetail == null ? void 0 : movieDetail.genres) ? movieDetail.genres.map((g) => g.name).join(", ") : "",
      releaseDate: (movieDetail == null ? void 0 : movieDetail.release_date) ?? "",
      id: (movieDetail == null ? void 0 : movieDetail.id) ?? 0
    })
  );
  return ` 
    ${headerContent}
  
    <div class="app-layout">
      <h1 class="sub-title">${subTitle}</h1>
      ${SearchResultMessage({
    isError: isSearchError,
    attribute: {
      class: "no-results"
    },
    children: "검색 결과를 불러오는데 실패하였습니다."
  })}
      ${MovieList({
    movies: displayMovieList,
    isSearchMode,
    searchQuery: searchInputValue
  })}
      ${moreErrorMessage}
    </div>
    
    ${Footer()}
    ${modalContent}
  `;
};
render(App, $("#app"));
