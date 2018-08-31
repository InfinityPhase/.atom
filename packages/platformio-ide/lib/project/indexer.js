/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from '../utils';

import { CompositeDisposable, Directory, File } from 'atom';
import { beginBusy, endBusy } from '../services/busy';

import { AUTO_REBUILD_DELAY } from '../config';
import fs from 'fs-plus';
import { isPioProject } from './helpers';
import path from 'path';


export default class ProjectIndexer {

  static PythonExecutable = null;

  constructor(projectPath) {
    this.projectPath = fs.realpathSync(projectPath);

    this.subscriptions = new CompositeDisposable();
    this.libDirWatchersSubscriptions = new Map();
    this.configFileSubscription = null;

    this._isActive = false;
    this._isRebuilding = false;
    this._rebuildInterval = null;
    this._updateLibDirWatchersTimeout = null;
  }

  async activate() {
    this._isActive = true;
    await this.addProjectDirWatcher();
    await this.addProjectConfigWatcher();
    await this.updateLibDirsWatchers();
  }

  deactivate() {
    this._isActive = false;
    this.subscriptions.dispose();
  }

  async addProjectDirWatcher() {
    try {
      const dir = new Directory(this.projectPath);
      if (await dir.exists()) {
        this.subscriptions.add(dir.onDidChange(() => this.addProjectConfigWatcher()));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async addProjectConfigWatcher() {
    try {
      if (this.configFileSubscription) {
        return;
      }

      const configFile = new File(path.join(this.projectPath, 'platformio.ini'));
      if (await configFile.exists()) {
        const configSubscriptions = new CompositeDisposable();
        configSubscriptions.add(configFile.onDidChange(() => {
          this.requestIndexRebuild();
          this.requestUpdateLibDirWatchers();
        }));
        configSubscriptions.add(configFile.onDidRename(() => this.removeProjectConfigWatcher()));
        configSubscriptions.add(configFile.onDidDelete(() => this.removeProjectConfigWatcher()));
        configSubscriptions.add(configFile.onWillThrowWatchError(() => this.removeProjectConfigWatcher()));

        this.configFileSubscription = configSubscriptions;
        this.subscriptions.add(configSubscriptions);

        // Current project has been initialized just now or it was just opened.
        // Either way we have to make sure that indexes are up to date.
        if (atom.config.get('platformio-ide.autoRebuildAutocompleteIndex')) {
          this.requestIndexRebuild();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeProjectConfigWatcher() {
    if (this.configFileSubscription) {
      this.subscriptions.remove(this.configFileSubscription);
      this.configFileSubscription.dispose();
      this.configFileSubscription = null;
    }
  }

  requestUpdateLibDirWatchers() {
    if (this._updateLibDirWatchersTimeout) {
      clearTimeout(this._updateLibDirWatchersTimeout);
    }
    this._updateLibDirWatchersTimeout = setTimeout(this.updateLibDirsWatchers.bind(this), AUTO_REBUILD_DELAY);
  }

  async updateLibDirsWatchers() {
    const libDirs = await this.fetchWatchDirs();

    for (const newLibDir of libDirs.filter(libDirPath => !this.libDirWatchersSubscriptions.has(libDirPath))) {
      await this.addLibDirWatcher(newLibDir);
    }

    for (const removedLibDir of Array.from(this.libDirWatchersSubscriptions.keys()).filter(libDirPath => !libDirs.includes(libDirPath))) {
      this.removeLibDirWatcher(removedLibDir);
    }
  }

  async addLibDirWatcher(libDirPath) {
    try {
      const dir = new Directory(libDirPath);
      if (await dir.exists()) {
        const libSubscription = dir.onDidChange(() => this.requestIndexRebuild());

        this.libDirWatchersSubscriptions.set(libDirPath, libSubscription);
        this.subscriptions.add(libSubscription);
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeLibDirWatcher(libDirPath) {
    const subscription = this.libDirWatchersSubscriptions.get(libDirPath);
    if (subscription) {
      this.subscriptions.remove(subscription);
      subscription.dispose();
    }
  }

  requestIndexRebuild() {
    if (this._rebuildInterval) {
      clearInterval(this._rebuildInterval);
    }
    this._rebuildInterval = setInterval(
      () => {
        if (this._isRebuilding) {
          return;
        }
        this.doRebuild();
        if (this._rebuildInterval) {
          clearInterval(this._rebuildInterval);
        }
      },
      AUTO_REBUILD_DELAY
    );
  }

  async doRebuild({verbose = false} = {}) {
    if (!this._isActive || this._isRebuilding) {
      return;
    }
    try {
      if (!isPioProject(this.projectPath)) {
        return;
      }

      this._isRebuilding = true;
      beginBusy(`Rebuilding C/C++ Project Index for ${this.projectPath}`);

      await new Promise((resolve, reject) => {
        pioNodeHelpers.core.runPIOCommand(['init', '--ide', 'atom', '--project-dir', this.projectPath], (code, stdout, stderr) => {
          if (code === 0) {
            if (verbose) {
              atom.notifications.addSuccess('PlatformIO: C/C++ Project Index (for Autocomplete, Linter) has been successfully rebuilt.');
            }
            resolve();
          } else {
            reject(stderr);
          }
        });
      });
    } catch (err) {
      utils.notifyError('C/C++ project index rebuild failed', err);
    } finally {
      this._isRebuilding = false;
      endBusy();
    }
  }

  async fetchWatchDirs() {
    if (!ProjectIndexer.PythonExecutable) {
      ProjectIndexer.PythonExecutable = await pioNodeHelpers.misc.getPythonExecutable(atom.config.get('platformio-ide.useBuiltinPIOCore'));
    }
    const scriptLines = [
      'from os.path import join',
      'from platformio import util',
      'print(":".join([join(util.get_home_dir(), "lib"), util.get_projectlib_dir(), util.get_projectlibdeps_dir()]))'
    ];
    return new Promise((resolve, reject) => {
      pioNodeHelpers.misc.runCommand(
        ProjectIndexer.PythonExecutable,
        ['-c', scriptLines.join(';')],
        (code, stdout, stderr) => {
          if (code === 0) {
            resolve(stdout.toString().trim().split(':'));
          } else {
            reject(stderr);
          }
        },
        {
          spawnOptions: {
            cwd: this.projectPath
          }
        }
      );
    });
  }
}
