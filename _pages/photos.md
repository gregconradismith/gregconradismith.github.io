---
layout: single
title: "Photos"
permalink: /photos/
author_profile: true
---

{% include base_path %}

{% assign photo_extensions = ".jpg,.jpeg,.png,.gif,.webp,.avif,.svg" %}
{% assign photos = site.static_files | sort: "path" %}
{% assign photo_count = 0 %}

<figure class="third">
  {% for photo in photos %}
    {% assign photo_ext = photo.extname | downcase %}
    {% if photo.path contains "/myphotos/" and photo_extensions contains photo_ext %}
      {% assign photo_count = photo_count | plus: 1 %}
      {% assign photo_alt = photo.basename | replace: "-", " " | replace: "_", " " | capitalize %}
      <a href="{{ base_path }}{{ photo.path }}">
        <img src="{{ base_path }}{{ photo.path }}" alt="{{ photo_alt | escape }}" loading="lazy">
      </a>
    {% endif %}
  {% endfor %}
  {% if photo_count == 0 %}
    <figcaption>No photos found in <code>myphotos/</code>.</figcaption>
  {% endif %}
</figure>
