# Version History Curiosity Report

## Introduction

For my curiosity report, I chose to look into the best ways and the reasoning behind version history. Both jwt-pizza and jwt-pizza-service use a version history that is made out of the current time down to the exact second. I have never before seen version history done this way, as most of my favorite applications use formatting in a group of three such as `18.200.19` or `2.10.2`.

Additionally, one of the biggest gaming companies, Mojang, recently changed how they keep track of their version history for their game Minecraft, using the format Year.Update.Patch. With all these different ways of formatting the same idea, I wanted to see which was best and the thought behind using one way over another.

---

## Major.Minor.Patch

One of the most typical ways that an application keeps track of its version is through the method Major.Minor.Patch. This system splits the version into three segments, with the largest changes affecting the major number and smallest changes affecting the patch number.

Typically, the patch version is changed when very small tweaks and fixes are made to the code. No features are added with a patch update and only address bugs within existing code.

When a new feature is added to the application, the minor version is increased. When a higher-level number is incremented, the lower number is typically reset to zero. In the case of `1.3.5`, if a minor update was rolled out, the new version would be `1.4.0`, and subsequent bug fixes would increase the patch number.

Lastly, the major version, or “breaking version,” is for large changes that are required to be done if the user still wants to use the application. These versions are reserved for major overhauls or large amounts of features being added or changed. This likewise resets the lower versions back to 0.

The main motivation for this kind of versioning is for programmers to keep track of what was done with the application.

---

## Version Date

The method of date versioning is much simpler than the Major.Minor.Patch method. This method uses the time and date that the application was updated. This can be used in a variety of different ways such as:

- `YearMonthDay`
- `YearMonthDay.HourMinuteSecond`

Most of the smaller values are optional to include in the version, but larger values like Year and Month are crucial for keeping track of the version.

The main motivation for this kind of versioning is for programmers and users to know exactly when an update was made for the application.

---

## Other Methods

While these two versioning methods are the most common, there are many other ways to track the version of an application. As mentioned previously, Mojang recently changed their version history for Minecraft, moving from a Major.Minor.Date method to a fusion of Major.Minor.Date and date.

A large motivating factor for this change is the discrepancy between the two editions of Minecraft, Java and Bedrock. Although they are the same game, these two editions have many differences between them. To better unify these, the versioning was changed to this hybrid method.

Another method used in the beginning stages of development on an application is **pre-release labels**. The most common ones are:

- alpha  
- beta  
- release candidate (rc)  

These indicate the stage that an application is in and how much a user should expect to be finished.

**Alpha** versions are some of the earliest working versions of an application, so only major functionality is finished. The group that tests these versions is also much smaller compared to the others.

**Beta** versions are still in a work-in-progress state, but much more of the application is fleshed out. There are typically many more testers for these versions.

Lastly, **release candidates (RC)** are versions of the application that are being tested for release. If the version meets the standard of the programmers, it will be pushed out for public use.

The main motivation for using alternate versioning methods is to eliminate confusion and better align the version with the goals of the application. Different projects require different priorities, and making the version reflect these priorities helps programmers and users better understand the application.

---

## Conclusion

There are many different methods for versioning an application, all with their own benefits. Because of this, there is no single “best” method for versioning.

If the program needs to convey the impact of an update, the Major.Minor.Patch approach works best. If the program needs to convey when an update was made, date versioning is a better fit.
If there are other needs that do not fit into these methods, the programmer can create a custom or hybrid system. 

Ultimately, the “best” method is the one that best fits the application and clearly communicates what has been done to it.