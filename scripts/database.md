# Install
sudo pacman -S postgresql

# Postgres User (Added automatically at install)
sudo -iu postgres

# Initial Config
[postgres]$ initdb -D /var/lib/postgres/data
...
[postgres]$ exit

# Start and Enable Service
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service

# Create Database User
sudo -iu postgres
[postgres]$ createuser --interactive
...
% Use same name as Linux username to access database without specifying user
...
[postgres]$ exit
$ createdb myDatabaseName
% For Elixir: $ createdb elixir


# Database Structure

```
boards
======
board_id
title
description
starred
closed
background_type
background_value
create_time
close_time
```

```
lists
=====
list_id
title
board_id
archived
previous_id
```

```
cards
=====
card_id
title
list_id
archived
cover_id
description
previous_id
create_time
archive_time
```

```
attachments
===========
attachment_id
url
name
card_id
color
creation_time
type
size
```

```
checklists
==========
checklist_id
title
card_id
previous_id
```

```
checklist_items
===============
item_id
item_content
checklist_id
checked
previous_id
```
