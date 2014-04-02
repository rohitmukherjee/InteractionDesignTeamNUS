Presi
=====

Presi is a prototypical implementation of a web application that synchronises a slideshow presentation between different clients. It is based on Node.js in conjunction with Socket.IO to realise inter-browser communication. It uses jQMultiTouch for touch/gesture event handling and adaptation of the layout according to the orientation of the mobile device.

Presi was designed to serve as a framework for the exercises of Principles of Interaction Design taught at ETH Zurich during the Spring Semester 2014.


Installation
------------
1. Download and install Node.js (http://nodejs.org)
2. `cd presi`
3. `npm install`
4. `npm start` (Later, this is sufficient to start the server)
5. http://localhost:8080/ (Make sure that the port is not used by other services and applications, e.g. Apache Tomcat)

Development
-----------

For development and testing, we recommend using Chrome (version 33 or higher) on the Nexus 7 tablet with Android (version 4.4.2 or higher).

Follow these instructions to setup Remote Debugging on Android: http://developers.google.com/chrome-developer-tools/docs/remote-debugging

Note that you also need to install Google's USB driver:
http://developer.android.com/sdk/win-usb.html

Study public/presi-remote.html and public/js/presi-remote.js in detail to get an understanding of the Presi Remote client and how it communicates with the Presi Display.

Also look at the jQMultiTouch web site and follow the code examples: http://dev.globis.ethz.ch/jqmultitouch/