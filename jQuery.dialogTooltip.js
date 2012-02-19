(function($){
  var plugin = {
    name: 'dialogTooltip'
  };

  var default_settings = {
    arrow: '.arrow',
    actions_holder: '.actions'
  };
  var anchor_settings = {
    dialog: false,
    buttons: []
  };

  function trigger_event(wrapper, event, options) {
   
  }

  var methods = {
    init: function(options) {
      var that = this;
      var settings = $.extend(default_settings, options);
      var data = {
        settings: settings,
        actions_holder: $(settings.actions_holder, this),
        arrow: $(settings.arrow, this),
        holder: this.parent(),
        documentClick: function(e){
          // Prevent hiding on self
          if (that.find('*').andSelf().filter(e.target).length > 0) return;

          methods.unbindHide.call(that);
          methods.hide.call(that);
        }
      };

      anchor_settings.dialog = this;

      this.data(plugin.name, data);
      this.detach();
    },

    destroy: function() {
      this.removeData(plugin.name);
      this.off(plugin.name);
    },

    show: function(target, offset) {
      if (!offset) {
        offset = target.offset();
      }
      this.data(plugin.name).target = target;

      this
        .detach()
        .appendTo(document.body);

      methods.bindHide.call(this);
      methods.reposition.call(this, offset);

      methods.trigger_event.call(this, 'show');
    },

    reposition: function(anchor_offset){
      var arrow = this.data(plugin.name).arrow;
      var offset = {
        top: anchor_offset.top - this.outerHeight() - arrow.outerHeight(),
        left: anchor_offset.left - arrow.position().left
      };

      this.offset(offset);

      methods.trigger_event.call(this, 'repositioned', {offset:offset, anchor_offset: anchor_offset});
    },

    hide: function() {
      var data = this.data(plugin.name);

      this
        .detach()
        .appendTo(data.holder);

      methods.trigger_event.call(this, 'hide');

      this.data(plugin.name).target = null;
    },

    setupButtons: function(buttons) {
      var holder = this.data(plugin.name).actions_holder;
      holder.html("");

      for (var i in buttons) {
        var button = buttons[i];
        if (typeof button == "string") {
          button = $.fn[plugin.name].buttons[button];
          if (!button) {
            $.error(plugin.name + ' ' + button + ' button does not exists');
            continue;
          }
        }
        methods.setupButton.call(this, holder, button);
      }
    },

    setupButton: function(holder, button) {
      var dialog = this;

      var a  = $('<a href="#" class="button" />')
        .addClass(button.id)
        .html(button.label)
        .click(function(e){
          e.preventDefault();
          var close = true;
          if (button.action) {
            close = button.action(dialog);
          }
          methods.trigger_event.call(dialog, 'action.' + button.id, {close: close});

          if (close) {
            methods.hide.call(dialog);
          }
        })
        .appendTo(holder);

    },

    trigger_event: function(event, options) {
      var target = this.data(plugin.name).target;
      this.add(target).trigger(plugin.name + '.' + event, options);
    },

    bindHide: function() {
      $(document).bind('click', this.data(plugin.name).documentClick);
    },

    unbindHide: function() {
      $(document).unbind('click', this.data(plugin.name).documentClick);
    }
  };

  var anchor_methods = {
    init: function(options) {
      var settings = $.extend(anchor_settings, options);
      var data = {
        settings: settings,
        dialog: $(settings.dialog)
      };

      anchor_methods.bind.call(this);
      this.data(plugin.name, data);
    },

    bind: function() {
      // In case init is called multiple times
      anchor_methods.unbind.call(this);

      this.bind('click', anchor_methods.click);
    },

    unbind: function() {
      this.unbind('click', anchor_methods.click);
    },

    destroy: function() {
      this.removeData(plugin.name);
      this.off(plugin.name);
    },

    show: function(offset) {
      anchor_methods.toggle.call(this, 'show', offset);
      var data = this.data(plugin.name);
      methods.setupButtons.call(data.dialog, data.settings.buttons);
    },

    hide: function() {
      anchor_methods.toggle.call(this, 'hide');
    },

    toggle: function(state, offset) {
      var dialog = this.data(plugin.name).dialog;
      methods[state].call(dialog, this, offset);
    },

    click: function(e) {
      if (e) {
        e.preventDefault();
        // Prevent hiding on self
        e.stopPropagation();
      }
      anchor_methods.show.call($(this), {left: e.pageX, top: e.pageY});
    }
  };

  function initPlugin(name, methods) {
    $.fn[name] = function(method) {

      var args = false;
      if ( typeof method === 'object' || ! method ) {
        // Constructor, method will hold its options
        args = [method];
        method = 'init';
      } else if ( methods[method] ) {
        // Method, shift method name to get its arguments
        args = Array.prototype.slice.call(arguments, 1);
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.' + plugin.name );
        return this;
      }
      return this.each(function(){
        methods[method].apply($(this), args);
      });
    };
  }

  initPlugin(plugin.name, methods);
  initPlugin(plugin.name + 'Anchor', anchor_methods);

  $.fn[plugin.name].buttons = {};

  $.fn[plugin.name].buttons.ok = {
    id: 'ok',
    label: 'Ok',
    action: function() {
      return true;
    }
  };

  $.fn[plugin.name].buttons.cancel = {
    id: 'cancel',
    label: 'Cancel',
    action: function() {
      return true;
    }
  };

  anchor_settings.buttons = [$.fn[plugin.name].buttons.ok];

})(jQuery);