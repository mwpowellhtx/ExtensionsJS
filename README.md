# ExtensionsJS

Provides JavaScript extension methods extending static and prototype functionality.

## Overview

* My goals with this project is not to provide full coverage right out of the gate. Coverage requirements will be discovered iteratively, as well as with community contribution.

* Similarly, my goals are not to provide feature parity, such as with ``ExtensionsJS.Array`` extensions, which draws from concepts found through [LINQ](http://msdn.microsoft.com/en-us/library/bb397926.aspx), specifically, [Enumerable](http://msdn.microsoft.com/en-us/library/system.linq.enumerable.aspx) extension methods. Although there will be similar concepts, some concessions must be made to cooperate with the underlying JavaScript features. For instance, instead of ``select`` being the name for [Enumerable.Select](http://msdn.microsoft.com/en-us/library/system.linq.enumerable.select.aspx) analog, I chose instead to name this ``project``, so as not to conflict the already several such function names, whose result is the projection of the array.

* I am in the process of migrating away from NuGet as my package management of choice for distribution purposes, but rather towards Node.js. Nothing against NuGet, per se, it is perfectly fine for pure .NET packages, but is really not well suited for JavaScript such as this. Currently I have this working, distributing to an internal package source. When I am comfortable with these results I will migrate to proper Node.js package source.

## Future Goals

* I would like to distribute minified versions of the packaged files. However, until it is, right now it is not a very high priority in the early stages.

* I would also like to provide IntelliSense style comments to the features. However, like with minification, this is a low priority right at the moment.

* The current features are by no means exhaustive. Contributions are welcome; the only thing I ask is that you include sensible *unit tests*, of a sort, through the embedded HTML files (not intended for distribution).
