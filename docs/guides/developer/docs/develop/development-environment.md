Development Environment
=======================

Common Developer Pitfalls
-------------------------

Every development environment has its quirks, so here are a few which have been collected by the community:

### General
* Build Opencast, then open your IDE.  Opencast generates a number of classes as part of its build process (eg:
  QSnapshotDto), which will not be found by your IDE and thus cause build errors.  It is possible to get your IDE
  to run the appropriate Maven lifecycle event, but that can be hit-and-miss in terms of functionality.
* If your IDE stubbornly refuses to acknowledge that a class exists, even when you're sure it's there, try closing your
  IDE, then running `git clean -fdx`, then building.  This will ensure everything in your clone is up to date.  Also
  ensure you find your project workspace to make sure your IDE isn't keeping a cache of things.
* Absolute worst case, remove your Maven cache (typically ~/.m2), and possibly your Node cache (typically ~/.npm) and
  repeat the above steps.  This is completely starting from scratch.

### IntelliJ
* Do not use the prebuilt indexes.

Developer Builds
----------------

Besides the default `dist` Maven profile, the assemblies project defines a second `dev` profile which will cause only
one allinone distribution to be created. It is already unpacked and ready to be started. Activate the profile using:

    mvn clean install -Pdev

The administrative user interface needs nodejs to build and phantomjs for testing purposes. These will be downloaded as
prebuilt binaries during the maven build process. If there are no prebuilt binaries for your operating system, you can
build the tools manually and then build opencast using the `frontend-no-prebuilt` maven profile:

    mvn clean install -Pdev,frontend-no-prebuilt

Logging During Builds
---------------------

While building Opencast, the default log level for Opencast modules is `WARN`. To increase logging for development,
edit the log level configuration in `docs/log4j/log4j.properties`.

Building single modules
-----------------------

When working on a single Opencast module, it can be extremely helpful to watch the newly built version and include
it automatically in the Opencast OSGi infrastructure. This can be done through the
[bundle:watch](https://karaf.apache.org/manual/latest/commands/bundle-watch.html) command in Karaf. The workflow would
be as follows:

* Start Opencast and use `la -u` in the Karaf console to list all installed bundles/modules. Note down the IDs of the
  bundles you want to watch.
* Use `bundle:watch IDs` to watch the desired modules, e.g. `bundle:watch 190 199`
* Make your changes and rebuild the module (e.g. execute `mvn clean install` in the module folder).
* Watch how Karaf automatically redeploys the changed jars from your local Maven repository. You can verify that
  everything went smoothly by checking the log with `log:tail`.

To see this technique in action, you can watch the following short video:

* [Opencast development: Watch and reload modules](https://asciinema.org/a/348132)

The updated bundles are only available in the currently running Karaf instance. To create a Opencast version that has
this changes permanently, you have to run `mvn clean install` in the the assemblies directory again. Your current
instance will be deleted by the new assembly!

In several cases the `bundle:watch` can bring Karaf in an unstable condition, as dependencies between bundles will not
correctly be restored, after the new bundle has been deployed.



