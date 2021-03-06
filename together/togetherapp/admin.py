from django.contrib import admin
from .models import User, RelationshipTip, Room, List, ListItem


class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "first_name", "last_name", "get_room")

    def get_room(self, obj):
        return obj.room.name if obj.room else 'N/A'


class RelationshipTipAdmin(admin.ModelAdmin):
    list_display = ("pk", "category", "title")


class RoomAdmin(admin.ModelAdmin):
    list_display = ("pk", "name")


class ListAdmin(admin.ModelAdmin):
    list_display = ("pk", "title", "timestamp", "get_room")

    def get_room(self, obj):
        return obj.room.name


class ListItemAdmin(admin.ModelAdmin):
    list_display = ("pk", "get_list", "get_content", "timestamp")

    def get_list(self, obj):
        return obj.list.title

    def get_content(self, obj):
        return obj.content[:20] + ('...' if len(obj.content) > 20 else '')


admin.site.register(User, UserAdmin)
admin.site.register(RelationshipTip, RelationshipTipAdmin)
admin.site.register(Room, RoomAdmin)
admin.site.register(List, ListAdmin)
admin.site.register(ListItem, ListItemAdmin)
