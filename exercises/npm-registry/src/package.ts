import { RequestHandler } from 'express';
import got from 'got';
import { satisfies } from 'semver';
import { cache as PackageCache } from './cache';

interface Package {
  name: string,
  version : string,
  dependencies?: object
}

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackageTree: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;

  try {
    const dependencies = await getDependencies(name, version);

    return res.status(200).json({ name, version, dependencies });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
const getDependencies = async function (name, version) {
    const details : Package = await getPackageDetails(name, version);
    return details.dependencies;
};

const getPackageDetails = async function (name, version) {
  let npmPackage = PackageCache().get(cacheKey(name,version))
  if (!npmPackage) {
    npmPackage = await got(
        `https://registry.npmjs.org/${name}`,
    ).json();
    PackageCache().set(cacheKey(name,version), npmPackage);
  }

  const dependencies = findDependenciesForVersion(npmPackage, version);
  if (dependencies == undefined) {
    return { name: name, version: version };
  }

  let promises : Promise<Package>[] = [];
  for (const dep_name of Object.keys(dependencies)) {
    promises.push(getPackageDetails(dep_name, dependencies[dep_name]));
  }

  return Promise.all(promises).then((results: Package[]) => {
    let enriched_dependencies = {};
    for (let i=0; i< results.length; i++) {
      enriched_dependencies[results[i].name] = results[i];
    }
    return {name: name, version: version, dependencies: enriched_dependencies}
  })
}

const findDependenciesForVersion = function (npmPackage, version) {
  for (let ver in npmPackage.versions) {
    if (satisfies(ver, version)) {
      return npmPackage.versions[ver].dependencies;
    }
  }
  throw 'version "'+version+'" for package "'+name+'" doesnt exist in registry';
}

const cacheKey = function(name, version) {
  return name+"_"+version;
}
