import fs from 'fs';
import git from 'isomorphic-git';
import path from 'path';

async function check() {
    const repoRoot = path.resolve(process.cwd(), '..');
    let matrix = await git.statusMatrix({ fs, dir: repoRoot, filepaths: ['autonexus/src/lib/vehicle-data.ts'] });
    console.log(matrix);
}
check();
