const createPopup = () => {
    let popup = document.createElement("div");
    popup.id = "popup";

    const popupContent = `
    <header>
        <h1>GDPR consent</h1>
        <div class="select-all-btn">SELECT ALL</div>
    </header>
    <section id="popup-vendors">
    </section>
    <footer>
        <button class="accept-btn">ACCEPT</button>
        <button class="reject-btn">REJECT</button>
    </footer>
    `;

    popup.insertAdjacentHTML('afterbegin', popupContent);
    document.body.appendChild(popup);
    document.querySelector('#app').style.filter = 'blur(8px)';

    const closePopup = () => {
        document.querySelector('#popup').style.display = 'none';
        document.body.style.overflow = 'initial';
        document.querySelector('#app').style.filter = 'none';
    };

    const attachClosePopup = (selector) => {
        document.querySelector(selector).addEventListener("click", () => {
            closePopup();
        });
    };

    document.querySelector('.select-all-btn').addEventListener("click", () => {
        const checkboxes = [...document.querySelectorAll('.vendor-checkbox')];
        if (checkboxes.every(checkbox => checkbox.checked)) {
            checkboxes.forEach(checkbox => checkbox.checked = false);
        } else {
            checkboxes.forEach(checkbox => checkbox.checked = true);
        }
    });

    document.querySelector('.accept-btn').addEventListener("click", () => {
        function setCookie(vendorsId) {
            let expires = "";
            const date = new Date();
            date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
            document.cookie = `vendors=${vendorsId}${expires}; path=/`;
        }
        let selectedVendorsId = [...document.querySelectorAll('.vendor-checkbox:checked')].map(element => element.name);
        setCookie(selectedVendorsId);
    });

    attachClosePopup('.accept-btn');
    attachClosePopup('.reject-btn');

    (() => {
        const getJSON = (url, callback) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = () => {
                const status = xhr.status;
                if (status === 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status, xhr.response);
                }
            };
            xhr.send();
        };

        getJSON('https://optad360.mgr.consensu.org/cmp/v2/vendor-list.json',
            (err, data) => {
                if (err !== null) {
                    alert('Something went wrong: ' + err);
                } else {
                    let vendorsHtml = Object.values(data.vendors).map(vendor =>
                        `<div class='vendor-box'>
                           <input class='vendor-checkbox' type="checkbox" id="vendor-${vendor.id}" name="${vendor.id}"/>
                           <label for="vendor-${vendor.id}" class="vendor-name">${vendor.name}</label>
                           <div class="vendor-policy">
                             <a class="policy-url" href="${vendor.policyUrl}" target="_blank">
                               PolicyUrl
                             </a>
                             <a class="mobile-policy" href="${vendor.policyUrl}" target="_blank">
                               Policy
                             </a>
                           </div>
                         </div>`
                    );
                    document.querySelector('#popup-vendors').innerHTML = vendorsHtml.join('');
                }
            });
    })();
};

const showPopup = () => {
    const getCookie = (cookieName) => {
        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let cookie of cookies) {
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) == 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return "";
    };

    if (!getCookie('vendors')) {
        createPopup();
    };
};

showPopup();