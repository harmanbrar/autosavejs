# autosavejs
A autosave function using RESTful API

This script uses the onBlur event attribute on form fields. The Idea is a text box would have onBlur linking to a save method somewhere in your JS. In that said save method you would use the AddToQueue function passing it the function and its arguments that makes the ajax POST call.

It should guarantee order using the timeout function and queue.

It might just a glorified event handler if you have other suggestions on improving it or another way of a implementing a autosave please let me know I'm always open and willing to learn!. 
