(() => {
	window.addEventListener('load', () => {
		fetchUserData();
	});

	const fetchUserData = () => {
		const loadingScreen = document.querySelector('.gh-loading-screen');

		const GITHUB_TOKEN = 'YOUR_GITHUB_ACCESS_TOKEN_HERE';

		const GraphqlApi = axios.create({
			baseURL: 'https://api.github.com/graphql',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`
			}
		});

		const params = new URLSearchParams(window.location.search)

		let userName = 'faarda';
		if(params.has('user')){
			userName = params.get('user');
		}

		const query =  () => `{
			user(login: "${userName}") {
				name
				avatarUrl
				bio
				login
				followers {
				totalCount
				}
				following {
				totalCount
				}
				location
				company
				starredRepositories {
					totalCount
				}
				repositories(last: 20, privacy: PUBLIC) {
					totalCount
					nodes {
						name
						description
						stargazers {
							totalCount
						}
						forkCount
						updatedAt
						primaryLanguage {
							name
						}
						url
					}
				}
			}
		}`;

		GraphqlApi.post('', {
			query: query()
		})
		.then(res => {
			if(res.data.data.user !== null){
				const {repositories , ...user} = res.data.data.user;
	
				addUserProfile(user);
				addUserRepos(repositories);
				return true;
			}else{
				loadingScreen.innerHTML = `<span>Oops! Github user <b>${userName}</b> not found</span>`;
				return false;
			}

		})
		.then((res) => {
			if(res){
				stickNavToTop();
				feather.replace();
				loadingScreen.remove();
			}
		})
		.catch(err => {
			loadingScreen.innerHTML = `Oops! Something went wrong`;
		})
	}

	const addUserProfile = ({avatarUrl, name, login, bio, location, company,
		followers : { totalCount: followersCount}, following: {totalCount: followingCount},
		starredRepositories: {totalCount: starred}
	}) => {
		const userProfileContainer = document.querySelector('.gh-main__profile');
		const profileImageHolders = document.querySelectorAll('.gh__header__user__img, .gh-tabs__user__img');
		const profileNameHolders = document.querySelectorAll('.user-name');

		//template for user profile
		const userProfileHTML = `
			<div class="gh-main__profile__user">
                <figure class="gh-main__profile__user__img">
                    <img src="${avatarUrl}" alt="">
                </figure>
                <div class="gh-main__profile__user__name">
                    <h1>${name}</h1>
                    <span class="username">${login}</span>
                </div>
            </div>
            <div class="gh-main__profile__about">
                ${bio}
            </div>
            <a href="" class="gh-btn gh-btn--light gh-btn--block mb-2">Edit Profile</a>
            <div class="gh-main__profile__stats">
				<a href="">
					<span data-feather="users" class="icon"></span> 
					<span class="stat-count">${followersCount}</span> 
					Followers
				</a>
                &nbsp;&centerdot;&nbsp;
				<a href="">
					<span class="stat-count">${followingCount}</span> 
					Following
				</a>
                &nbsp;&centerdot;&nbsp;
				<a href="">
					<span data-feather="star" class="icon"></span>
					<span class="stat-count">${starred}</span>
				</a>
            </div>
			<div class="gh-main__profile__extra-details">
				${
					company ?
					`<div class="gh-main__profile__extra-details__detail">
						<span data-feather="briefcase" class="icon"></span>
						${company}
					</div>` :
					''
				}
				${
					location ?
					`<div class="gh-main__profile__extra-details__detail">
						<span data-feather="map-pin" class="icon"></span>
						${location}
					</div>` :
					''
				}

			</div>`;
			
		const profileImage = `<img src="${avatarUrl}" alt="Profile Image">`;


		userProfileContainer.innerHTML = userProfileHTML;
		profileImageHolders.forEach(holder => {
			holder.innerHTML = profileImage;
		})
		profileNameHolders.forEach(holder => {
			holder.innerHTML = `${login}`;
		})
	}

	const addUserRepos = ({nodes: repos, totalCount}) => {
		const reposContainer = document.querySelector('.gh-main__repos__list');
		const reposCountBadge = document.querySelector('.repos-count');

		reposCountBadge.innerHTML = totalCount;

		//create html list items from repo list
		const repoListHtml = repos.map(({name, description, url, forkCount, updatedAt,
			 stargazers: {totalCount: stars}, primaryLanguage}) => {
			    return `<li class="gh-main__repos__repo">
                    <div class="gh-main__repos__repo__top">
                        <div class="gh-main__repos__repo__details">
                            <h2 class="title">
                                <a href="${url}">
                                    ${name}
                                </a>
                            </h2>
                            <p class="desc">
                                ${description ? description : ''}
                            </p>
                        </div>
						<a href="" class="gh-btn gh-btn--light gh-btn--sm">
							<span class="icon" data-feather="star"></span>&nbsp; Star
						</a>
                    </div>
                    <div class="gh-main__repos__repo__details__extra">
                        <span class="detail">${primaryLanguage ? primaryLanguage.name : ''}</span>
                        <span class="detail"><span data-feather="star"></span> ${stars}</span>
                        <span class="detail"><span data-feather="git-branch"></span> ${forkCount}</span>
                        <span class="detail">Updated ${timeSince(updatedAt)} ago</span>
                    </div>
                </li>`;
		}).join('');
		
		reposContainer.innerHTML = repoListHtml;
		        
	}
	
	const stickNavToTop = () => {
		const navTabs = document.querySelector('.gh-tabs__container');
		const tabTop = navTabs.offsetTop;
	
		const profileImage = document.querySelector('.gh-main__profile__user__img');
		const profileTop = profileImage.clientHeight + profileImage.offsetTop - navTabs.clientHeight;
	
		const tabsUser = document.querySelector('.gh-tabs__user');
	
		window.addEventListener('scroll', () => {
			const windowTop = window.scrollY;
	
			// stick the navigation tab to the top
			if(windowTop > tabTop + 20){
				navTabs.classList.add('fixed');
			}else{
				navTabs.classList.remove('fixed');
			}
	
			//show the user details on the navigation tab
			if(windowTop > profileTop - 20){
				tabsUser.classList.add('visible');
			}else{
				tabsUser.classList.remove('visible');
			}
		});
	}

	const timeSince = (date) => {

		let seconds = Math.floor((new Date() - Date.parse(date)) / 1000);

		let interval = seconds / 31536000;

		if(interval > 1) return `${Math.floor(interval)} year(s)`;
		interval = seconds / 2592000;
		if(interval > 1) return `${Math.floor(interval)} month(s)`;
		interval = seconds / 86400;
		if(interval > 1) return `${Math.floor(interval)} day(s)`;
		interval = seconds / 3600;
		if(interval > 1) return `${Math.floor(interval)} hour(s)`;;
		interval = seconds / 60;
		if(interval > 1) return `${Math.floor(interval)} minute(s)`;

		return `${Math.floor(seconds)} seconds`;
	}
})();