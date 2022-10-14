/*
Source code : https://github.com/rzepkowski/ckeditor-base64image
Based on 2 existing CKEditor plugins merged together and enhanced with additionnal features :
- base64image (https://github.com/nmmf/base64image)
- pastebase64 (https://github.com/javaha/ckeditor-pastebase64)
*/
(function () {
  const DEFAULT_MAX_IMG_SIZE_KB = 1200;

  CKEDITOR.plugins.add("base64image", {
    lang: "en,fr",
    requires: "dialog",
    icons: "base64image",
    hidpi: true,
    init: function (editor) {
      var pluginName = 'base64imageDialog';

      editor.ui.addButton("base64image", {
        label: editor.lang.common.image,
        command: pluginName,
        toolbar: "insert,10"
      });
      CKEDITOR.dialog.add(pluginName, this.path + "dialogs/base64image.js");

      var allowed = 'img[alt,!src]{border-style,border-width,float,height,margin,margin-bottom,margin-left,margin-right,margin-top,width}',
          required = 'img[alt,src]';

      editor.addCommand(pluginName, new CKEDITOR.dialogCommand(pluginName, {
        allowedContent: allowed,
        requiredContent: required,
        contentTransformations: [
          ['img{width}: sizeToStyle', 'img[width]: sizeToAttribute'],
          ['img{float}: alignmentToStyle', 'img[align]: alignmentToAttribute']
        ]
      }));

      if (editor.addFeature) {
        editor.addFeature({allowedContent: 'img[alt,id,!src]{width,height};'});
      }

      editor.on("doubleclick", function (evt) {
        if (evt.data.element && !evt.data.element.isReadOnly() && evt.data.element.getName() === "img") {
          evt.data.dialog = pluginName;
          editor.getSelection().selectElement(evt.data.element);
        }
      });

      editor.on("contentDom", function () {
        var editableElement = editor.editable ? editor.editable() : editor.document;
        editableElement.on("paste", onPaste, null, {editor: editor});
      });

      if (editor.addMenuItem) {
        editor.addMenuGroup("base64imageGroup");
        editor.addMenuItem("base64imageItem", {
          label: editor.lang.common.image,
          icon: this.path + "icons/base64image.png",
          command: pluginName,
          group: "base64imageGroup"
        });
      }

      if (editor.contextMenu) {
        editor.contextMenu.addListener(function (element, selection) {
          if (element && element.getName() === "img") {
            editor.getSelection().selectElement(element);
            return {base64imageItem: CKEDITOR.TRISTATE_ON};
          }
          return null;
        });
      }
    },

    isMaxImgSizeOverflow(editor, imgBase64) {
      const maxImageSizeKb = parseInt(editor.config.base64image_maxImgSizeKb) || DEFAULT_MAX_IMG_SIZE_KB;
      if (new Blob([imgBase64]).size > maxImageSizeKb * 1000) {
        alert(editor.lang.base64image.maxImgSizeOverflow.replace('%1', maxImageSizeKb));
        return true;
      }
      return false;
    }
  });

  function onPaste(event) {
    var editor = event.listenerData && event.listenerData.editor;
    var $event = event.data.$;
    var clipboardData = $event.clipboardData;
    var found = false;
    var imageType = /^image/;

    if (!clipboardData) {
      return;
    }

    return Array.prototype.forEach.call(clipboardData.types, function (type, i) {
      if (found) {
        return;
      }

      if (type.match(imageType) || clipboardData.items[i].type.match(imageType)) {
        readImageAsBase64(clipboardData.items[i], editor);
        return found = true;
      }
    });
  }

  function readImageAsBase64(item, editor) {
    if (!item || typeof item.getAsFile !== 'function') {
      return;
    }

    var file = item.getAsFile();
    var reader = new FileReader();

    reader.onload = function (evt) {
      const imgBase64 = evt.target.result;
      if (editor.plugins.base64image.isMaxImgSizeOverflow(editor, src)) {
        return false;
      }
      var element = editor.document.createElement('img', {
        attributes: {
          src: imgBase64
        }
      });

      // We use a timeout callback to prevent a bug where insertElement inserts at first caret position
      setTimeout(function () {
        editor.insertElement(element);
      }, 10);
    };

    reader.readAsDataURL(file);
  }
})();
