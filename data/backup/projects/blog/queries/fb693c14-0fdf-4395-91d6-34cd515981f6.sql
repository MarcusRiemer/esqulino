SELECT comment.commenter_name, comment.text, comment.date
FROM article
	JOIN comment
WHERE article.article_id = comment.article_id
	AND comment.article_id = :artikel_id