CREATE TABLE IF NOT EXISTS `ed_url_cache` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `url` varchar(255) NOT NULL,
  `post_vars` text,
  `req_time` int(11) NOT NULL,
  `result` longtext character set utf8 collate utf8_unicode_ci,
  UNIQUE KEY `id` (`id`),
  KEY `url` (`url`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;