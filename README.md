🔀 Git Workflow (Team Standard)
Always pull latest changes before starting work: DO NOT DO THIS IF YOU ALREADY HAVE STARTED WOKING
```
git fetch
git checkout main
git pull origin main
```
Create a feature branch:
```
git checkout -b your-feature-branch
```
Make changes → add → commit:
```
git add .
git commit -m "Describe your changes here"
```
Push branch to GitHub:
```
git push origin your-feature-branch
```
Open a Pull Request (PR) on GitHub
Go to the repo on GitHub.
Compare & create PR into main.
Wait for approval and merge.
After merging:
```
git checkout main
git pull origin main
git branch -d your-feature-branch              # delete local branch
git push origin --delete your-feature-branch   # delete remote branch
```
