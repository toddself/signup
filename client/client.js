  var $ = window.jQuery
  var $button = $('.js-signup')
  var $email = $('.js-email')
  var $message = $('.js-message')

  function hideError () {
    $email.on('input', function () {
      $message.html().css('display', 'none')
      $email.off('input')
    })
  }

  function handleError (xhr, status, error) {
    console && console.log && console.log('failure', status, error)
    $message.html('Sorry, an error occurred, please try again').css('display', 'block')
    hideError()
  }

  function handleSuccess (data, status, xhr) {
    console && console.log && console.log('success', data, status)
    $message.html('Please check your email').css('display', 'block')
    setTimeout(function () {
      $message.html().css('display', 'none')
    }, 1000)
  }

  $button.on('click', function (evt) {
    evt.preventDefault()
    var address = $button.val()

    if (!/.+@.+\..+/.test(address)) {
      $message
        .html([address, 'is an invalid email address'].join(' '))
        .css('display', 'block')
      hideError()
      return false
    }

    var opts = {
      contentType: 'application/json',
      data: {email: address},
      dataType: 'json',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      statusCode: {
        500: handleError,
        400: handleError
      },
      success: handleSuccess,
      error: handleError
    }

    $.ajax(opts)
    return false
  })
