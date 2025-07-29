# Right Click to Image

This Chrome extension sends highlighted text to OpenAI's GPT-Image-1 image
generation API and displays the resulting image in a new window. The image is
saved automatically to your Downloads folder.

## Features

- Highlight text and use the context menu or the extension button to generate an image.
- OpenAI API key stored via the options page.
- Choose image size and quality (auto/high/medium/low) in settings.
- Append custom style text to the prompt.
- Optionally enhance the selected text with GPT-4.1 mini to create a polished prompt.
- Generate multiple images at once and view them in a simple gallery.
- Customize the downloaded file names with a user-defined prefix.
- Keep a history of generated images and view them from the extension.
- Click any image in the viewer or history to copy its URL to the clipboard.
- Configure how many history entries are kept via the History Size option.
- Shows a progress window while the image is being generated.
- Errors are shown as popup alerts when generation fails.


## Installing

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this directory.
3. Open the extension's **Options** page to set your OpenAI API key and preferences.

## Usage

Select text on any web page and either right click and choose
"Generate image from selection" or click the extension icon. A new window will
open with the generated image, which is also downloaded automatically.
Use the "View image history" context menu item or the **View History** button on
the options page to see previously generated images. Click any thumbnail to copy
its URL to the clipboard.
You can adjust how many entries are kept by changing the **History Size** value
in the options page.
