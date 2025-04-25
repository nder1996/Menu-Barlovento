$(document).ready(function() {
    // Detect browser language
    let userLang = navigator.language || navigator.userLanguage;
    userLang = userLang.split('-')[0]; // Get the primary language code
    
    // Default to Spanish if not supported
    if (!['es', 'en', 'fr'].includes(userLang)) {
        userLang = 'es';
    }

    const texts = {
        es: {
            title: "Bienvenido a nuestra experiencia culinaria",
            text: "Disfrute de la auténtica cocina de Conchy, donde los sabores del mar y la tierra se encuentran en platos caseros preparados con la frescura de ingredientes locales y el cariño tradicional de nuestra costa. Cada receta transmite el calor, la alegría y la hospitalidad del Caribe, haciéndole sentir como parte de nuestra familia en cada bocado."
        },
        en: {
            title: "Welcome to our culinary experience",
            text: "Enjoy Conchy's authentic cuisine, where flavors from the sea and land come together in homemade dishes prepared with fresh local ingredients and the traditional care of our coast. Each recipe conveys the warmth, joy, and hospitality of the Caribbean, making you feel like part of our family with every bite."
        },
        fr: {
            title: "Bienvenue dans notre expérience culinaire",
            text: "Savourez la cuisine authentique de Conchy, où les saveurs de la mer et de la terre se rencontrent dans des plats faits maison préparés avec la fraîcheur des ingrédients locaux et l'affection traditionnelle de notre côte. Chaque recette transmet la chaleur, la joie et l'hospitalité des Caraïbes, vous faisant sentir comme un membre de notre famille à chaque bouchée."
        }
    };

    function changeLanguage(lang) {
        $("#welcome-title").text(texts[lang].title);
        $("#welcome-text").text(texts[lang].text);
        
        // Actualizar botones activos
        $(".language-selector button").removeClass("active");
        $("#" + lang).addClass("active");
    }
    
    // Set active language button
    $(`.btn[data-lang=${userLang}]`).removeClass('btn-outline-primary').addClass('btn-primary');
    
    // Load menu data with logging for debugging
    $.getJSON('menu.json', function(data) {
        console.log("JSON cargado correctamente:", data); // Añadido para depuración
        
        // Set initial language
        changeLanguage(userLang);
        languageWithMenu(userLang, data);
        
        // Handle language button clicks
        $('.language-selector button').click(function() {
            const lang = $(this).data('lang');
            
            // Update buttons appearance
            $('.language-selector button').removeClass('btn-primary').addClass('btn-outline-primary');
            $(this).removeClass('btn-outline-primary').addClass('btn-primary');
            
            // Change language for welcome text
            changeLanguage(lang);
            
            // Change language for menu
            languageWithMenu(lang, data);
        });
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error loading menu.json:", textStatus, errorThrown);
        $('.menu-items').html('<p class="text-danger">Error loading menu. Please try again later.</p>');
    });

    // Function to change language with menu data
    function languageWithMenu(lang, data) {
        // Verificar que los datos están disponibles
        if (!data || !data.menu || !data.menu[lang]) {
            console.error(`No se encontraron datos del menú para el idioma: ${lang}`);
            $('.menu-items').html('<p class="text-danger">No se pudo cargar el menú para este idioma.</p>');
            return;
        }
        
        // Set page language attribute
        $('html').attr('lang', lang);
        
        // Update static text elements
        $('#hotel-name').text(data.translations[lang]?.title || 'La Cocina De Conchy');
        // $('#welcome-title').text(data.translations[lang]?.title || 'Menú');
        $('#footer-text').text(
            lang === 'en' ? 'Thank you for visiting us. Come back soon!' :
            lang === 'fr' ? 'Merci de nous avoir rendu visite. Revenez bientôt !' :
            'Gracias por visitarnos. ¡Vuelve pronto!'
        );
        
        // Clear existing menu items
        $('.menu-items').empty();
        
        // Dynamically render each category
        Object.keys(data.menu[lang]).forEach(category => {
            const containerId = `${category.toLowerCase().replace(/\s+/g, '-')}-items`;
            
            // Buscar el nombre traducido de la categoría de manera segura
            let categoryName = category;
            
            // Verificamos si las traducciones existen para este idioma y categoría
            if (data.translations && 
                data.translations[lang] && 
                data.translations[lang][category] && 
                data.translations[lang][category].name) {
                categoryName = data.translations[lang][category].name;
            }
            
            // Add category header
            $('.menu-items').append(`
                <div id="${containerId}">
                    <h3 class="category-title">${categoryName}</h3>
                    <div class="row"></div>
                </div>
            `);
            
            // Render menu items for the category
            renderMenuItems(containerId, data.menu[lang][category], lang);
        });
    }
    
    // Function to render menu items
    function renderMenuItems(containerId, items, lang) {
        const container = $(`#${containerId} .row`);
        items.forEach(item => {
            const availabilityText = 
                lang === 'en' ? item.availability :
                lang === 'fr' ? (item.availability === 'Year-round' ? 'Toute l\'année' : 'Saisonnier') :
                item.availability === 'Year-round' ? 'Todo el año' : 'Estacional';
            
            const itemHtml = `
                <div class="col-md-6 col-lg-4">
                    <div class="menu-item">
                        <h5>${item.name}</h5>
                        <p class="price">${item.price} COP</p>
                        <p class="description">${item.description}</p>
                        <p class="availability"><strong>Disponibilidad:</strong> ${availabilityText}</p>
                    </div>
                </div>
            `;
            container.append(itemHtml);
        });
    }
});