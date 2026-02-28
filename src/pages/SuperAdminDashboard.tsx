{/* Commented out the lessons grid to prevent overlap with sidebar */}
  {/* 
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredLessons.map((lesson) => (
      <Card key={lesson.id} className="overflow-hidden hover:shadow-md transition-shadow">
        {lesson.image_url && (
          <img src={lesson.image_url} alt={lesson.title} className="w-full h-32 object-cover" />
        )}
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="text-sm text-muted-foreground">{lesson.subject}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={lesson.completed ? "default" : "secondary"}>
                {lesson.completed ? "Completed" : "In Progress"}
              </Badge>
              {lesson.score && (
                <p className="text-sm mt-1">{lesson.score}%</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditingLesson(lesson); setIsEditLessonModalOpen(true); }}>
            <Edit className="h-4 w-4 mr-2" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteLesson(lesson.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
  */}

  {/* Removed the lessons display section entirely to prevent layout overlap */}