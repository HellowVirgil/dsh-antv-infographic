# Repository Guidelines

## npm 发版流程

本仓库发布 npm 包时，必须严格遵循 **GitHub Release → npm publish** 的顺序。GitHub Release 是公开发布记录，npm 包必须来自同一个不可变的 Git tag 和 commit。

### 1. 准备版本

从最新的 `main` 开始，确认目标版本尚未发布：

```bash
git switch main
git pull --ff-only origin main
npm view dsh-antv-infographic@X.Y.Z version
```

若 npm 已返回该版本，不得复用；选择新的版本号。然后更新版本和变更记录：

```bash
pnpm version patch --no-git-tag-version
# 按实际改动更新 CHANGELOG.md
```

`patch` 可按语义化版本规则替换为 `minor`、`major` 或明确的版本号。

### 2. 本地验证

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run verify:pack
```

检查打包清单和元数据，确保不包含本地绝对路径、凭据、临时文件或未预期的内容。

### 3. 提交并等待 CI

```bash
git add package.json pnpm-lock.yaml CHANGELOG.md
git commit -m "chore(release): vX.Y.Z"
git push origin main
```

等待 `main` 分支 CI 全部通过。CI 未通过时不得创建 tag、GitHub Release 或发布 npm 包。

### 4. 创建不可变 tag 和 GitHub Release

确认当前 `main` 的 HEAD 就是已通过 CI 的发版 commit，再创建 annotated tag：

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z --verify-tag --title "vX.Y.Z" --generate-notes
```

必须先成功创建 GitHub Release，之后才能执行 `npm publish`。

### 5. 从同一个 tag 发布 npm

切换到刚刚发布 GitHub Release 的精确 tag，重新验证并发布：

```bash
git switch --detach vX.Y.Z
pnpm install --frozen-lockfile
pnpm run check
pnpm run verify:pack
npm publish
```

`package.json` 中的 `publishConfig` 已固定公开访问和官方 npm registry；不要在命令中临时改用其他 registry。

### 6. 发布后验证

```bash
npm view dsh-antv-infographic@X.Y.Z version dist-tags dist.tarball
dsh plugin --profile web add dsh-antv-infographic@X.Y.Z
git switch main
```

确认 npm 元数据正确，并验证 DSH 能安装指定版本。

## 发版约束

- 不得移动、覆盖或强推已经发布的 tag。
- 不得复用已经存在的 npm 版本号。
- 不得在 GitHub Release 创建前执行 `npm publish`。
- 鉴权、网络或 npm 服务故障时，从同一个 tag 重试发布，不要重新生成 tag。
- 如果包内容错误，修复后发布新的 patch 版本；不要修改既有 tag 或 Release。
- 不把 `npm unpublish` 作为常规纠错流程；确需撤回时必须由维护者明确决定。
- token、OTP、密码等凭据不得写入文件、命令参数、日志或 commit。
- 发版操作必须使用 `HellowVirgil` 对应的 GitHub 和 npm 账号，并在执行前确认当前登录身份。
