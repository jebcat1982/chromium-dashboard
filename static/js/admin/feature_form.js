(function() {
  'use strict';

  var fields = document.querySelectorAll('input, textarea');
  for (var i = 0; i < fields.length; ++i) {
    fields[i].addEventListener('blur', function(e) {
      e.target.classList.add('interacted');
    });
  }

  // TODO(ericbidelman): These values are brittle if changed in the db later on.
  var MIN_MILESTONE_TO_BE_ACTIVE = 3;
  var MIN_STD_TO_BE_ACTIVE = 5;
  var NO_LONGER_PURSUING = 1000;

  var form = document.querySelector('[name="feature_form"]');
  form.addEventListener('change', function(e) {
    switch (e.target.tagName.toLowerCase()) {
      case 'select':
        if (e.target.id === 'id_impl_status_chrome') {
          toggleMilestones(e.target);
        } else if (e.target.id === 'id_standardization') {
          toggleSpecLink(e.target);
        }
        break;
      case 'input':
        if (e.target.name === 'shipped_milestone') {
          fillOperaFields(e.target);
        }
        break;
      default:
        break;
    }
  });

  var operaDesktop = document.querySelector('#id_shipped_opera_milestone');
  var operaAndroid = document.querySelector(
      '#id_shipped_opera_android_milestone');

  /**
   * Populates Opera version inputs with Chrome 32 -> Opera 19 version mapping.
   * @param {HTMLInputElement} chromeField Chrome version input.
   */
  function fillOperaFields(chromeField) {
    var chromeVersion = chromeField.valueAsNumber;
    if (chromeVersion < 28) {
      return;
    }
    var operaVersion = chromeVersion - 13; // e.g. Chrome 32 ~ Opera 19
    if (!operaDesktop.classList.contains('interacted')) {
      operaDesktop.value = operaVersion;
    }
    if (!operaAndroid.classList.contains('interacted')) {
      operaAndroid.value = operaVersion;
    }
  }

  var specLink = document.querySelector('#id_spec_link');

  /**
   * Toggles the spec link input.
   * @param {HTMLInputElement} stdStage Input element.
   */
  function toggleSpecLink(stdStage) {
    specLink.disabled = parseInt(stdStage.value, 10) >= MIN_STD_TO_BE_ACTIVE;
    specLink.parentElement.parentElement.hidden = specLink.disabled;
  }

  /**
   * Toggles the chrome milestone inputs.
   * @param {HTMLInputElement} status Input element.
   */
  function toggleMilestones(status) {
    var val = parseInt(status.value, 10);
    var disabled = (val <= MIN_MILESTONE_TO_BE_ACTIVE ||
                    val === NO_LONGER_PURSUING);

    var shippedInputs = document.querySelectorAll('[name^="shipped_"]');
    [].forEach.call(shippedInputs, function(input) {
      input.disabled = disabled;
      input.parentElement.parentElement.hidden = input.disabled;
    });

    // var milestone = document.querySelector('#id_shipped_milestone');
    // milestone.disabled = parseInt(status.value) <= MIN_MILESTONE_TO_BE_ACTIVE;
    // milestone.parentElement.parentElement.hidden = milestone.disabled;
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.remove('loading');

    // Get around Django rendering input type="text" fields for URLs.
    var inputs = document.querySelectorAll('[name$="_url"], [name$="_link"]');
    [].forEach.call(inputs, function(input) {
      input.type = 'url';
      input.placeholder = 'http://';
    });

    var shippedInputs = document.querySelectorAll('[name^="shipped_"]');
    [].forEach.call(shippedInputs, function(input) {
      input.type = 'number';
      input.placeholder = 'Milestone #';
    });

    var owner = document.querySelector('[name="owner"]');
    owner.type = 'email';
    owner.multiple = true;

    toggleMilestones(document.querySelector('#id_impl_status_chrome'));
  });

  document.body.addEventListener('ajax-delete', function(e) {
    if (e.detail.status === 200) {
      location.href = '/features';
    }
  });
})();
