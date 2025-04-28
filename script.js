$(document).ready(function(){
    // Navbar sticky behavior
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }

        // Scroll-up button show/hide
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }

        // Active Nav Link on Scroll (Scrollspy)
        let scrollPos = $(document).scrollTop();
        $('.navbar .menu a').each(function () {
            let currLink = $(this);
            let refHref = currLink.attr("href");

            // Check if href exists, starts with #, and is longer than just #
            if (refHref && refHref.startsWith('#') && refHref.length > 1) {
                 try { // Use try-catch block for robustness if element doesn't exist
                     let refElement = $(refHref);
                     if (refElement.length) {
                        // Adjust offset based on navbar height (approx 70px) + buffer
                        let topPos = refElement.offset().top;
                        let bottomPos = topPos + refElement.outerHeight();

                        // Check if section is within viewport bounds (+/- offset)
                        if (topPos - 75 <= scrollPos && bottomPos - 75 > scrollPos) {
                             $('.navbar .menu a').removeClass("active");
                             currLink.addClass("active");
                        } else {
                             currLink.removeClass("active");
                        }
                     }
                 } catch (e) {
                    console.warn("Scrollspy: Could not find element for href:", refHref);
                    currLink.removeClass("active"); // Ensure inactive if target not found
                 }
            }
        });

        // Special case for home section when scrolled to the very top
        // Check if scroll position is less than the top of the 'about' section minus offset
        try {
             if ($('#about').length && scrollPos < $('#about').offset().top - 75) {
                 $('.navbar .menu a').removeClass("active");
                 $('.navbar .menu a[href="#home"]').addClass("active");
             }
        } catch (e) {
             console.warn("Scrollspy: Could not find #about element for top check.");
        }


    }); // End of scroll function

    // Scroll-up button click
    $('.scroll-up-btn').click(function(){
        $('html, body').animate({scrollTop: 0}, 500); // Add smooth animation
        // Remove scroll behavior override introduced by jQuery animation
        $('html').css("scrollBehavior", "auto");
    });

    // Smooth scroll for menu items and buttons with href starting with #
    $('.navbar .menu a, a.btn[href^="#"], .home .scroll-down').on('click', function(e) {
        let targetHref = $(this).attr('href');

        // Ensure it's an internal link and not just '#'
        if (targetHref && targetHref.startsWith('#') && targetHref.length > 1) {
             e.preventDefault(); // Prevent default jump

             try { // Use try-catch in case target doesn't exist
                 let targetElement = $(targetHref);
                 if (targetElement.length) {
                     // Apply smooth scroll behavior temporarily for this animation
                     $('html').css("scrollBehavior", "smooth");

                     // Scroll to the target element, adjusting for fixed navbar height
                    $('html, body').animate({
                         scrollTop: targetElement.offset().top - 60 // Adjust offset (navbar height)
                    }, 800, function(){ // Duration of scroll animation
                         // Callback after animation completes
                         $('html').css("scrollBehavior", "auto"); // Reset scroll behavior

                         // Close mobile menu if open after clicking a link
                         if($('.navbar .menu').hasClass('active')) {
                            $('.navbar .menu').removeClass("active");
                            $('.menu-btn-mobile i').removeClass("active");
                         }
                    });
                 }
             } catch (error) {
                 console.error("Smooth scroll target not found:", targetHref, error);
             }
        }
    }); // End of smooth scroll click


    // Toggle mobile menu
    $('.menu-btn-mobile').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn-mobile i').toggleClass("active");
    });

    // Typing animation - Home Section
    if ($('.typing').length) {
        var typed = new Typed(".typing", {
            strings: ["Data Software Engineer", "ETL Developer", "Data Scientist", "Python Programmer", "Cloud Practitioner", "AI/ML Engineer"],
            typeSpeed: 100,
            backSpeed: 60,
            loop: true,
            smartBackspace: true // Improves deleting similar parts
        });
    }

    // Typing animation - About Section
    if ($('.typing-2').length) {
        var typed2 = new Typed(".typing-2", {
            strings: ["Data Engineer", "Problem Solver", "Cloud Practitioner", "Lifelong Learner", "Team Player"],
            typeSpeed: 100,
            backSpeed: 60,
            loop: true,
            smartBackspace: true
        });
    }

    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,      // values from 0 to 3000, with step 50ms
        easing: 'ease-in-out', // default easing for AOS animations
        once: true,         // whether animation should happen only once - while scrolling down
        mirror: false,      // whether elements should animate out while scrolling past them
        anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
        offset: 100         // offset (in px) from the original trigger point
    });

    // No specific Waypoints logic needed if relying on AOS for animations like skill bars
    // AOS will trigger animations when elements enter the viewport based on its settings.
    

    // === Add this code INSIDE the $(document).ready(function(){ ... }); block ===

    // Contact Form AJAX Submission
    const contactForm = $('#contact-form'); // Use the ID we added
    const formStatus = $('#form-status');   // The div to show messages

    contactForm.on('submit', function(event) {
        event.preventDefault(); // Prevent the default browser submission

        // Clear previous status messages and hide the status div
        formStatus.html('').removeClass('success error visible').hide();

        // Show a temporary sending message (optional)
        formStatus.html('Sending...').addClass('visible').show();

        const formData = new FormData(this);
        const formAction = $(this).attr('action'); // Get URL from form's action attribute

        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json' // Important: Ask FormSubmit for a JSON response
            }
        })
        .then(response => {
            if (response.ok) {
                // Success!
                contactForm[0].reset(); // Clear the form fields
                formStatus.html("Thank You!<br>Your message has been sent successfully. I'll get back to you as soon as possible.")
                          .removeClass('error') // Ensure no error class
                          .addClass('success visible'); // Add success class and make visible
            } else {
                // Server responded with an error (e.g., FormSubmit internal issue)
                response.json().then(data => { // Try to get error details from FormSubmit
                    let errorMessage = "Oops! There was a problem submitting your form.";
                    if (data && data.error) {
                        errorMessage += ` Error: ${data.error}`;
                    }
                     formStatus.html(errorMessage)
                               .removeClass('success')
                               .addClass('error visible');
                }).catch(() => {
                    // Failed to parse JSON error details
                    formStatus.html("Oops! There was a problem submitting your form. Server error.")
                              .removeClass('success')
                              .addClass('error visible');
                });
            }
        })
        .catch(error => {
            // Network error or other fetch issue
            console.error('Form submission error:', error);
            formStatus.html("Oops! There was a network error. Please check your connection and try again.")
                      .removeClass('success')
                      .addClass('error visible');
        })
        .finally(() => {
             // Optional: You could remove the 'Sending...' message here if you added one,
             // but showing the final status is usually enough.

             // Automatically hide the status message after some time (e.g., 10 seconds)
             setTimeout(() => {
                 formStatus.removeClass('visible').fadeOut(500, function() {
                    // Reset classes after fading out
                    $(this).removeClass('success error').html('').hide();
                 });
             }, 10000); // 10000 milliseconds = 10 seconds
        });
    });

// === End of added code ===

}); // End of document ready