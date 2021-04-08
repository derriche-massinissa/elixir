# Install
```shell
sudo pacman -S postgresql
```

# Postgres User (Added automatically at install)
```shell
sudo -iu postgres
```

# Initial Config
```shell
[postgres]$ initdb -D /var/lib/postgres/data
...
[postgres]$ exit
```

# Start and Enable Service
```shell
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service
```

# Create Database User
```shell
sudo -iu postgres
[postgres]$ createuser --interactive
...
(Use same name as Linux username to access database without specifying user)
...
[postgres]$ exit
$ createdb elixir
```


# Database Structure

### boards
- board\_id
- title
- description
- starred
- closed
- background\_type
- background\_value
- create\_time
- close\_time

### lists
- list\_id
- title
- board\_id
- archived
- previous\_id

### cards
- card\_id
- title
- list\_id
- archived
- cover\_id
- description
- previous\_id
- create\_time
- archive\_time

### attachments
- attachment\_id
- url
- name
- card\_id
- color
- creation\_time
- type
- size

### checklists
- checklist\_id
- title
- card\_id
- previous\_id

### checklist\_items
- item\_id
- item\_content
- checklist\_id
- checked
- previous\_id
