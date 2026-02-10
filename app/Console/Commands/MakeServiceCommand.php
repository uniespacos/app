<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

class MakeServiceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:service {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria uma nova classe de serviço';

    /**
     * @var Filesystem
     */
    protected $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();
        $this->files = $files;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $path = app_path("Services/{$name}.php");
        $directory = app_path('Services');

        if (! $this->files->isDirectory($directory)) {
            $this->files->makeDirectory($directory, 0755, true, true);
        }

        if ($this->files->exists($path)) {
            $this->error('Serviço já existe!');

            return 1;
        }

        $stub = $this->getStub();
        $stub = str_replace('{{className}}', $name, $stub);

        $this->files->put($path, $stub);
        $this->info('Serviço criado com sucesso!');

        return 0;
    }

    protected function getStub(): string
    {
        return <<<EOT
<?php

namespace App\Services;

class {{className}}
{
    // Sua lógica de negócio aqui...
}
EOT;
    }
}
