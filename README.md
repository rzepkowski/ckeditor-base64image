# Base64Image plugin for CKEditor 4

- Adds images from local client as base64 string into the editor without server side processing
- Adds external image urls into the editor
- Adds images from the clipboard as base64 string into the editor

## Requirements

The Browser must support the JavaScript [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API).

## Installation

 1. Download the plugin
 
 2. Extract (decompress) the downloaded file into the plugins folder of your CKEditor installation.
	Example: `/ckeditor/plugins/base64image`
	
 3. Enable the plugin by using the `extraPlugins` configuration setting.
	Example: `CKEDITOR.config.extraPlugins = "base64image";`

## Configuration

By default the plugin blocks the insertion of images larger than 1200 KB and displays a warning.
This default value can be overriden with the `base64image_maxImgSizeKb` configuration setting.
Example: `CKEDITOR.config.base64image_maxImgSizeKb = 2500;`
